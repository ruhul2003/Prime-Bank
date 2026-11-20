import { Response } from "express";
import mongoose from "mongoose";
import { DepositWithdrawRequest } from "../models/DepositWithdrawRequest";
import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import { Notification } from "../models/Notification";
import { AuditLog } from "../models/AuditLog";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/errorHandler";
import { generateRequestId, generateTransactionId } from "../utils/generate";

export const submitRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { accountId, type, amount, description } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  const reqAmount = Number(amount);
  if (!reqAmount || reqAmount <= 0) {
    throw new AppError("Amount must be greater than zero.", 400);
  }

  if (!["deposit", "withdrawal"].includes(type)) {
    throw new AppError("Invalid request type. Must be 'deposit' or 'withdrawal'.", 400);
  }

  const account = await Account.findById(accountId);
  if (!account) throw new AppError("Account not found", 404);

  // If customer, verify ownership
  if (req.user.role === "customer" && account.userId.toString() !== req.user._id.toString()) {
    throw new AppError("Unauthorized access to account.", 403);
  }

  if (account.status !== "active") {
    throw new AppError(`Cannot submit requests for a ${account.status} account.`, 400);
  }

  // Pre-validate withdrawal balance
  if (type === "withdrawal") {
    if (account.balance - reqAmount < account.minBalance) {
      throw new AppError(
        `Insufficient funds. Account balance is $${account.balance}, minimum balance requirement is $${account.minBalance}.`,
        400
      );
    }
  }

  const newRequest = await DepositWithdrawRequest.create({
    requestId: generateRequestId(),
    userId: req.user._id,
    accountId: account._id,
    type,
    amount: reqAmount,
    description: description || `${type.toUpperCase()} request for account ${account.accountNumber}`,
    status: "pending",
  });

  await Notification.create({
    userId: req.user._id,
    title: `${type === "deposit" ? "Deposit" : "Withdrawal"} Request Submitted`,
    message: `Your ${type} request of $${reqAmount.toLocaleString()} is currently under review by bank staff.`,
    type: "transaction",
  });

  res.status(201).json({
    success: true,
    message: `${type === "deposit" ? "Deposit" : "Withdrawal"} request submitted successfully.`,
    request: newRequest,
  });
};

export const getMyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);

  const requests = await DepositWithdrawRequest.find({ userId: req.user._id })
    .populate("accountId", "accountNumber accountType balance")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
};

export const getAllRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, type, page = 1, limit = 20 } = req.query;

  const query: any = {};
  if (status) query.status = status;
  if (type) query.type = type;

  const skip = (Number(page) - 1) * Number(limit);

  const [requests, total] = await Promise.all([
    DepositWithdrawRequest.find(query)
      .populate("userId", "name email phone")
      .populate("accountId", "accountNumber accountType balance status")
      .populate("reviewedBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    DepositWithdrawRequest.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    requests,
  });
};

export const reviewRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { action, notes } = req.body; // action: 'approve' or 'reject'
  if (!req.user) throw new AppError("Unauthorized", 401);

  if (!["approve", "reject"].includes(action)) {
    throw new AppError("Action must be 'approve' or 'reject'.", 400);
  }

  const request = await DepositWithdrawRequest.findById(id).populate("accountId");
  if (!request) throw new AppError("Request not found", 404);

  if (request.status !== "pending") {
    throw new AppError(`This request has already been ${request.status}.`, 400);
  }

  // Prevent users from approving their own requests
  if (request.userId.toString() === req.user._id.toString()) {
    throw new AppError("Security violation: You cannot approve your own transaction request.", 403);
  }

  const account = await Account.findById(request.accountId._id);
  if (!account) throw new AppError("Associated bank account not found.", 404);

  if (action === "reject") {
    request.status = "rejected";
    request.reviewNotes = notes || "Rejected by bank staff.";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    await Notification.create({
      userId: request.userId,
      title: `${request.type.toUpperCase()} Request Rejected`,
      message: `Your request of $${request.amount.toLocaleString()} for account ${account.accountNumber} was rejected. Note: ${request.reviewNotes}`,
      type: "transaction",
    });

    res.status(200).json({
      success: true,
      message: "Request rejected.",
      request,
    });
    return;
  }

  // APPROVE WORKFLOW
  if (request.type === "withdrawal") {
    if (account.balance - request.amount < account.minBalance) {
      throw new AppError(
        `Insufficient balance in customer account. Balance: $${account.balance}, Required: $${request.amount + account.minBalance}.`,
        400
      );
    }
  }

  const session = await mongoose.startSession();
  let txnId = generateTransactionId();

  try {
    session.startTransaction();

    if (request.type === "deposit") {
      account.balance += request.amount;
    } else {
      account.balance -= request.amount;
    }
    await account.save({ session });

    // Create completed Transaction
    const [createdTxn] = await Transaction.create(
      [
        {
          transactionId: txnId,
          ...(request.type === "deposit"
            ? { receiverAccountId: account._id, receiverUserId: request.userId, receiverAccountNumber: account.accountNumber }
            : { senderAccountId: account._id, senderUserId: request.userId, senderAccountNumber: account.accountNumber }),
          type: request.type,
          amount: request.amount,
          fee: 0,
          status: "completed",
          description: request.description || `${request.type.toUpperCase()} processed by staff`,
          reference: `REQ-${request.requestId}`,
        },
      ],
      { session }
    );

    request.status = "approved";
    request.reviewNotes = notes || "Approved and settled.";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.transactionId = createdTxn.transactionId;
    await request.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new AppError("Failed to settle transaction. Database rolled back.", 500);
  } finally {
    session.endSession();
  }

  // Notify customer
  await Notification.create({
    userId: request.userId,
    title: `${request.type.toUpperCase()} Approved`,
    message: `Your ${request.type} of $${request.amount.toLocaleString()} for account ${account.accountNumber} has been approved. New balance: $${account.balance.toLocaleString()}.`,
    type: "transaction",
  });

  // Audit Log
  await AuditLog.create({
    action: `REQUEST_${request.type.toUpperCase()}_APPROVED`,
    performedBy: req.user._id,
    targetType: "DepositWithdrawRequest",
    targetId: request._id.toString(),
    details: { amount: request.amount, accountNumber: account.accountNumber, txnId },
  });

  res.status(200).json({
    success: true,
    message: `${request.type.toUpperCase()} approved and account balance updated successfully.`,
    request,
    accountBalance: account.balance,
  });
};
