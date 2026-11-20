import { Response } from "express";
import mongoose from "mongoose";
import { Loan, ILoan } from "../models/Loan";
import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import { Notification } from "../models/Notification";
import { AuditLog } from "../models/AuditLog";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/errorHandler";
import { generateLoanId, generateTransactionId } from "../utils/generate";

// Loan amortization helper
const calculateMonthlyInstallment = (
  principal: number,
  annualInterestRate: number,
  durationMonths: number
): number => {
  const r = annualInterestRate / 100 / 12;
  const n = durationMonths;
  if (r === 0) return Math.round((principal / n) * 100) / 100;
  const installment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(installment * 100) / 100;
};

export const applyLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    accountId,
    loanType,
    requestedAmount,
    durationMonths,
    monthlyIncome,
    employmentStatus,
    description,
  } = req.body;

  if (!req.user) throw new AppError("Unauthorized", 401);

  const amount = Number(requestedAmount);
  const months = Number(durationMonths);
  const income = Number(monthlyIncome);

  if (!amount || amount < 500) {
    throw new AppError("Minimum loan application amount is $500.", 400);
  }

  if (!months || months < 3 || months > 120) {
    throw new AppError("Loan duration must be between 3 and 120 months.", 400);
  }

  if (!income || income <= 0) {
    throw new AppError("Please provide a valid monthly income.", 400);
  }

  const account = await Account.findById(accountId);
  if (!account) throw new AppError("Selected disbursement account not found.", 404);

  // If customer, verify ownership
  if (req.user.role === "customer" && account.userId.toString() !== req.user._id.toString()) {
    throw new AppError("Unauthorized access to account.", 403);
  }

  if (account.status !== "active") {
    throw new AppError("Cannot attach loan to an inactive or frozen account.", 400);
  }

  // Interest rates: personal: 7.5%, business: 6.0%, home: 4.5%, education: 5.0%
  const rateMap: Record<string, number> = {
    personal: 7.5,
    business: 6.0,
    home: 4.5,
    education: 5.0,
  };
  const interestRate = rateMap[loanType] || 6.5;

  const monthlyInstallment = calculateMonthlyInstallment(amount, interestRate, months);
  const totalRepayment = Math.round(monthlyInstallment * months * 100) / 100;

  // Generate repayment schedule
  const schedule = [];
  const now = new Date();
  for (let i = 1; i <= months; i++) {
    const dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + i);
    schedule.push({
      installmentNumber: i,
      dueDate,
      amount: monthlyInstallment,
      status: "pending" as const,
    });
  }

  const newLoan = await Loan.create({
    loanId: generateLoanId(),
    userId: req.user._id,
    accountId: account._id,
    loanType,
    requestedAmount: amount,
    approvedAmount: 0,
    interestRate,
    durationMonths: months,
    monthlyIncome: income,
    employmentStatus: employmentStatus || "Employed",
    description: description || `${loanType.toUpperCase()} loan application`,
    status: "pending",
    remainingBalance: totalRepayment,
    monthlyInstallment,
    forwardedByStaff: false,
    repaymentSchedule: schedule,
  });

  await Notification.create({
    userId: req.user._id,
    title: "Loan Application Received",
    message: `Your application ${newLoan.loanId} for $${amount.toLocaleString()} has been submitted and is in queue for staff review.`,
    type: "loan",
  });

  res.status(201).json({
    success: true,
    message: "Loan application submitted successfully.",
    loan: newLoan,
  });
};

export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);

  const loans = await Loan.find({ userId: req.user._id })
    .populate("accountId", "accountNumber accountType")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: loans.length,
    loans,
  });
};

export const getAllLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, loanType, page = 1, limit = 20, search } = req.query;

  const query: any = {};
  if (status) query.status = status;
  if (loanType) query.loanType = loanType;
  if (search) {
    query.loanId = { $regex: search, $options: "i" };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [loans, total] = await Promise.all([
    Loan.find(query)
      .populate("userId", "name email phone role status")
      .populate("accountId", "accountNumber accountType balance")
      .populate("reviewedByStaff", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Loan.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    loans,
  });
};

export const getLoanById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const loan = await Loan.findOne({
    $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { loanId: id }],
  })
    .populate("userId", "name email phone address")
    .populate("accountId", "accountNumber accountType balance status")
    .populate("reviewedByStaff", "name email")
    .populate("approvedBy", "name email");

  if (!loan) throw new AppError("Loan application not found", 404);

  // If customer, ensure ownership
  if (req.user?.role === "customer" && loan.userId._id.toString() !== req.user._id.toString()) {
    throw new AppError("Unauthorized access to this loan file.", 403);
  }

  res.status(200).json({
    success: true,
    loan,
  });
};

export const reviewLoanStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { staffNotes, forwardForApproval } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  const loan = await Loan.findById(id).populate("userId", "name");
  if (!loan) throw new AppError("Loan not found", 404);

  if (loan.status !== "pending" && loan.status !== "under_review") {
    throw new AppError(`Cannot modify loan with status '${loan.status}'.`, 400);
  }

  // Prevent staff from modifying their own loan
  if (loan.userId.toString() === req.user._id.toString()) {
    throw new AppError("Staff cannot review their own loan applications.", 403);
  }

  if (staffNotes) loan.staffNotes = staffNotes;
  if (forwardForApproval) {
    loan.forwardedByStaff = true;
    loan.status = "under_review";
  }
  loan.reviewedByStaff = req.user._id;
  await loan.save();

  await AuditLog.create({
    action: "LOAN_STAFF_REVIEW",
    performedBy: req.user._id,
    targetType: "Loan",
    targetId: loan._id.toString(),
    details: { loanId: loan.loanId, staffNotes, forwarded: forwardForApproval },
  });

  res.status(200).json({
    success: true,
    message: forwardForApproval
      ? "Loan reviewed and forwarded for Admin final approval."
      : "Internal staff notes added.",
    loan,
  });
};

export const approveLoanAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { approvedAmount, interestRate } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  const loan = await Loan.findById(id).populate("accountId");
  if (!loan) throw new AppError("Loan not found", 404);

  if (loan.status === "approved" || loan.status === "active" || loan.status === "completed") {
    throw new AppError("Loan has already been approved or disbursed.", 400);
  }

  const finalAmount = Number(approvedAmount) > 0 ? Number(approvedAmount) : loan.requestedAmount;
  const finalRate = Number(interestRate) > 0 ? Number(interestRate) : loan.interestRate;

  const monthlyInstallment = calculateMonthlyInstallment(finalAmount, finalRate, loan.durationMonths);
  const totalRepayment = Math.round(monthlyInstallment * loan.durationMonths * 100) / 100;

  const account = await Account.findById(loan.accountId._id);
  if (!account) throw new AppError("Customer disbursement account not found.", 404);

  // Recalculate schedule with approved amount
  const schedule = [];
  const now = new Date();
  for (let i = 1; i <= loan.durationMonths; i++) {
    const dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + i);
    schedule.push({
      installmentNumber: i,
      dueDate,
      amount: monthlyInstallment,
      status: "pending" as const,
    });
  }

  const session = await mongoose.startSession();
  let txnId = generateTransactionId();

  try {
    session.startTransaction();

    // 1. Credit customer account with approved funds
    account.balance += finalAmount;
    await account.save({ session });

    // 2. Record disbursement banking transaction
    const [disbursedTxn] = await Transaction.create(
      [
        {
          transactionId: txnId,
          receiverAccountId: account._id,
          receiverUserId: loan.userId,
          receiverAccountNumber: account.accountNumber,
          type: "loan_disbursement",
          amount: finalAmount,
          fee: 0,
          status: "completed",
          description: `Disbursement for Loan ${loan.loanId}`,
          reference: `LOAN-DISB-${loan.loanId}`,
        },
      ],
      { session }
    );

    // 3. Update Loan State
    loan.status = "active";
    loan.approvedAmount = finalAmount;
    loan.interestRate = finalRate;
    loan.monthlyInstallment = monthlyInstallment;
    loan.remainingBalance = totalRepayment;
    loan.repaymentSchedule = schedule;
    loan.approvedBy = req.user._id;
    loan.disbursementTransactionId = disbursedTxn.transactionId;
    await loan.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new AppError("Failed to disburse loan funds. Transaction rolled back.", 500);
  } finally {
    session.endSession();
  }

  // Post notifications & audit
  await Notification.create({
    userId: loan.userId,
    title: "Loan Approved & Disbursed! 🎉",
    message: `Your loan ${loan.loanId} for $${finalAmount.toLocaleString()} has been approved and credited to account ${account.accountNumber}.`,
    type: "loan",
  });

  await AuditLog.create({
    action: "LOAN_APPROVED_AND_DISBURSED",
    performedBy: req.user._id,
    targetType: "Loan",
    targetId: loan._id.toString(),
    details: { loanId: loan.loanId, approvedAmount: finalAmount, account: account.accountNumber, txnId },
  });

  res.status(200).json({
    success: true,
    message: `Loan approved and $${finalAmount.toLocaleString()} disbursed to account ${account.accountNumber}.`,
    loan,
    accountNewBalance: account.balance,
  });
};

export const rejectLoanAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  const loan = await Loan.findById(id);
  if (!loan) throw new AppError("Loan not found", 404);

  if (loan.status === "active" || loan.status === "completed") {
    throw new AppError("Cannot reject an active or completed loan.", 400);
  }

  loan.status = "rejected";
  loan.rejectionReason = reason || "Does not meet institutional underwriting criteria.";
  loan.approvedBy = req.user._id;
  await loan.save();

  await Notification.create({
    userId: loan.userId,
    title: "Loan Application Declined",
    message: `Your loan application ${loan.loanId} has been declined. Reason: ${loan.rejectionReason}`,
    type: "loan",
  });

  await AuditLog.create({
    action: "LOAN_REJECTED",
    performedBy: req.user._id,
    targetType: "Loan",
    targetId: loan._id.toString(),
    details: { loanId: loan.loanId, reason: loan.rejectionReason },
  });

  res.status(200).json({
    success: true,
    message: "Loan application rejected.",
    loan,
  });
};

export const payLoanInstallment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { installmentNumber } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  const loan = await Loan.findById(id).populate("accountId");
  if (!loan) throw new AppError("Loan not found", 404);

  if (loan.status !== "active") {
    throw new AppError("Installment payments are only accepted for active loans.", 400);
  }

  // Find schedule item
  const scheduleIndex = loan.repaymentSchedule.findIndex(
    (item) => item.installmentNumber === Number(installmentNumber)
  );

  if (scheduleIndex === -1) {
    throw new AppError("Specified installment number not found.", 404);
  }

  const installment = loan.repaymentSchedule[scheduleIndex];
  if (installment.status === "paid") {
    throw new AppError("This installment has already been paid.", 400);
  }

  const account = await Account.findById(loan.accountId._id);
  if (!account) throw new AppError("Account not found", 404);

  if (account.balance - installment.amount < account.minBalance) {
    throw new AppError(
      `Insufficient balance in linked account. Balance: $${account.balance}, required: $${installment.amount + account.minBalance}.`,
      400
    );
  }

  const session = await mongoose.startSession();
  let txnId = generateTransactionId();

  try {
    session.startTransaction();

    // Deduct installment from customer account
    account.balance -= installment.amount;
    await account.save({ session });

    // Record repayment transaction
    const [txn] = await Transaction.create(
      [
        {
          transactionId: txnId,
          senderAccountId: account._id,
          senderUserId: loan.userId,
          senderAccountNumber: account.accountNumber,
          type: "loan_repayment",
          amount: installment.amount,
          fee: 0,
          status: "completed",
          description: `Repayment for Loan ${loan.loanId} - Installment #${installment.installmentNumber}`,
          reference: `LOAN-PAY-${loan.loanId}-${installment.installmentNumber}`,
        },
      ],
      { session }
    );

    // Update schedule
    loan.repaymentSchedule[scheduleIndex].status = "paid";
    loan.repaymentSchedule[scheduleIndex].paidDate = new Date();
    loan.repaymentSchedule[scheduleIndex].transactionId = txn.transactionId;

    loan.remainingBalance = Math.max(0, loan.remainingBalance - installment.amount);

    // If all installments paid or remaining balance is 0
    const pendingInstallments = loan.repaymentSchedule.filter((item) => item.status === "pending");
    if (pendingInstallments.length === 0 || loan.remainingBalance <= 0) {
      loan.status = "completed";
      loan.remainingBalance = 0;
    }

    await loan.save({ session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw new AppError("Payment processing failed. Balance was not charged.", 500);
  } finally {
    session.endSession();
  }

  await Notification.create({
    userId: loan.userId,
    title: "Loan Installment Paid",
    message: `Installment #${installment.installmentNumber} of $${installment.amount.toLocaleString()} paid successfully for Loan ${loan.loanId}. Remaining: $${loan.remainingBalance.toLocaleString()}.`,
    type: "loan",
  });

  res.status(200).json({
    success: true,
    message: `Installment #${installment.installmentNumber} paid successfully.`,
    loan,
    accountNewBalance: account.balance,
  });
};
