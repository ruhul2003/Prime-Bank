import { Response } from "express";
import mongoose from "mongoose";
import { Transaction, ITransaction, TransactionType, TransactionStatus } from "../models/Transaction";
import { Account } from "../models/Account";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/errorHandler";
import { generateTransactionId } from "../utils/generate";
import { Notification } from "../models/Notification";
import { AuditLog } from "../models/AuditLog";

export const transferFund = async (req: AuthRequest, res: Response): Promise<void> => {
  const { senderAccountId, recipientAccountNumber, amount, description = "", transactionPin } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  const transferAmount = Number(amount);
  if (!transferAmount || transferAmount <= 0) {
    throw new AppError("Transfer amount must be greater than zero.", 400);
  }

  if (!transactionPin) {
    throw new AppError("Transaction PIN is required to authorize fund transfer.", 400);
  }

  // 1. Fetch Sender Account
  const senderAccount = await Account.findById(senderAccountId).populate("userId", "name email");
  if (!senderAccount) {
    throw new AppError("Sender account not found.", 404);
  }

  // Verify ownership
  if (req.user.role === "customer" && senderAccount.userId._id.toString() !== req.user._id.toString()) {
    throw new AppError("Unauthorized: You do not own this sender account.", 403);
  }

  // Check sender account status
  if (senderAccount.status !== "active") {
    throw new AppError(`Sender account is ${senderAccount.status}. Transfers are not permitted.`, 400);
  }

  // Verify PIN
  const isPinValid = await senderAccount.comparePin(transactionPin);
  if (!isPinValid) {
    throw new AppError("Invalid transaction PIN. Transfer rejected.", 400);
  }

  // 2. Fetch Receiver Account
  const receiverAccount = await Account.findOne({
    accountNumber: recipientAccountNumber.trim(),
  }).populate("userId", "name email");

  if (!receiverAccount) {
    throw new AppError("Recipient account number does not exist.", 404);
  }

  if (senderAccount.accountNumber === receiverAccount.accountNumber) {
    throw new AppError("Sender and recipient accounts cannot be the same.", 400);
  }

  if (receiverAccount.status !== "active") {
    throw new AppError("Recipient account is currently inactive or frozen.", 400);
  }

  // 3. Limits Verification
  if (transferAmount > senderAccount.maxSingleTransferLimit) {
    throw new AppError(
      `Amount exceeds your maximum single transfer limit of $${senderAccount.maxSingleTransferLimit.toLocaleString()}.`,
      400
    );
  }

  // Daily Limit check
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const dailyTransfers = await Transaction.aggregate([
    {
      $match: {
        senderAccountId: senderAccount._id,
        type: "transfer",
        status: "completed",
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        totalToday: { $sum: "$amount" },
      },
    },
  ]);

  const totalSpentToday = dailyTransfers.length > 0 ? dailyTransfers[0].totalToday : 0;
  if (totalSpentToday + transferAmount > senderAccount.dailyTransferLimit) {
    throw new AppError(
      `Daily transfer limit reached. Limit: $${senderAccount.dailyTransferLimit}, Used today: $${totalSpentToday}.`,
      400
    );
  }

  // Calculate Fee ($0 for transfers under $500, flat $2 for transfers over $500)
  const fee = transferAmount >= 500 ? 2 : 0;
  const totalDeduction = transferAmount + fee;

  // 4. Balance check
  if (senderAccount.balance - totalDeduction < senderAccount.minBalance) {
    throw new AppError(
      `Insufficient funds. Available balance: $${senderAccount.balance}. Required minimum balance: $${senderAccount.minBalance}.`,
      400
    );
  }

  // 5. Suspicious Activity Rule Check
  let isFlagged = false;
  let flaggedReason = "";
  if (transferAmount >= 10000) {
    isFlagged = true;
    flaggedReason = "Automated Flag: High-value transaction exceeding $10,000 threshold.";
  }

  const transactionId = generateTransactionId();

  // 6. Atomic Execution with Mongoose Session & Transaction
  const session = await mongoose.startSession();
  let completedTxn: ITransaction;

  try {
    session.startTransaction();

    // Deduct from sender
    senderAccount.balance -= totalDeduction;
    await senderAccount.save({ session });

    // Credit to receiver
    receiverAccount.balance += transferAmount;
    await receiverAccount.save({ session });

    // Record the atomic transaction
    const [txn] = await Transaction.create(
      [
        {
          transactionId,
          senderAccountId: senderAccount._id,
          senderUserId: senderAccount.userId._id,
          senderAccountNumber: senderAccount.accountNumber,
          receiverAccountId: receiverAccount._id,
          receiverUserId: receiverAccount.userId._id,
          receiverAccountNumber: receiverAccount.accountNumber,
          type: "transfer",
          amount: transferAmount,
          fee,
          status: "completed",
          description: description || `Transfer to ${receiverAccount.accountNumber}`,
          reference: `REF-${Date.now()}`,
          isFlagged,
          flaggedReason,
        },
      ],
      { session }
    );

    completedTxn = txn;

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new AppError("Transaction failed to process atomically. No funds were debited.", 500);
  } finally {
    session.endSession();
  }

  // 7. Post-transaction notifications & audit
  try {
    // Notify Sender
    await Notification.create({
      userId: senderAccount.userId._id,
      title: "Funds Transferred",
      message: `You successfully sent $${transferAmount.toLocaleString()} to account ${receiverAccount.accountNumber}. Transaction ID: ${transactionId}.`,
      type: "transaction",
    });

    // Notify Receiver
    await Notification.create({
      userId: receiverAccount.userId._id,
      title: "Funds Received",
      message: `You received $${transferAmount.toLocaleString()} from ${senderAccount.userId.name || "PrimeBank Account"}. Current balance: $${receiverAccount.balance.toLocaleString()}.`,
      type: "transaction",
    });

    // Audit log
    await AuditLog.create({
      action: "FUND_TRANSFER",
      performedBy: req.user._id,
      targetType: "Transaction",
      targetId: completedTxn._id.toString(),
      details: {
        transactionId,
        from: senderAccount.accountNumber,
        to: receiverAccount.accountNumber,
        amount: transferAmount,
        fee,
      },
    });
  } catch (e) {
    console.error("Non-critical notification error:", e);
  }

  res.status(200).json({
    success: true,
    message: "Fund transfer completed successfully.",
    transaction: completedTxn,
    senderNewBalance: senderAccount.balance,
  });
};

export const getMyTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);

  const {
    page = 1,
    limit = 15,
    type,
    status,
    accountId,
    startDate,
    endDate,
    search,
  } = req.query;

  // Find customer accounts
  const userAccounts = await Account.find({ userId: req.user._id }).select("_id");
  const accountIds = userAccounts.map((a) => a._id);

  const query: any = {
    $or: [{ senderAccountId: { $in: accountIds } }, { receiverAccountId: { $in: accountIds } }],
  };

  if (accountId) {
    query.$or = [{ senderAccountId: accountId }, { receiverAccountId: accountId }];
  }

  if (type) query.type = type;
  if (status) query.status = status;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (search) {
    query.$or = [
      { transactionId: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { senderAccountNumber: { $regex: search, $options: "i" } },
      { receiverAccountNumber: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate("senderUserId", "name email")
      .populate("receiverUserId", "name email")
      .populate("senderAccountId", "accountNumber accountType")
      .populate("receiverAccountId", "accountNumber accountType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Transaction.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    transactions,
  });
};

export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 20,
    type,
    status,
    search,
    startDate,
    endDate,
    isFlagged,
  } = req.query;

  const query: any = {};

  if (type) query.type = type;
  if (status) query.status = status;
  if (isFlagged !== undefined) query.isFlagged = isFlagged === "true";

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  if (search) {
    query.$or = [
      { transactionId: { $regex: search, $options: "i" } },
      { senderAccountNumber: { $regex: search, $options: "i" } },
      { receiverAccountNumber: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate("senderUserId", "name email")
      .populate("receiverUserId", "name email")
      .populate("senderAccountId", "accountNumber accountType")
      .populate("receiverAccountId", "accountNumber accountType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Transaction.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    transactions,
  });
};

export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const transaction = await Transaction.findOne({
    $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { transactionId: id }],
  })
    .populate("senderUserId", "name email phone")
    .populate("receiverUserId", "name email phone")
    .populate("senderAccountId", "accountNumber accountType")
    .populate("receiverAccountId", "accountNumber accountType");

  if (!transaction) throw new AppError("Transaction not found", 404);

  // If customer, ensure they are sender or receiver
  if (req.user?.role === "customer") {
    const isSender = transaction.senderUserId?._id.toString() === req.user._id.toString();
    const isReceiver = transaction.receiverUserId?._id.toString() === req.user._id.toString();
    if (!isSender && !isReceiver) {
      throw new AppError("Unauthorized access to this transaction record.", 403);
    }
  }

  res.status(200).json({
    success: true,
    transaction,
  });
};

export const flagSuspiciousTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isFlagged, reason } = req.body;

  const transaction = await Transaction.findById(id);
  if (!transaction) throw new AppError("Transaction not found", 404);

  transaction.isFlagged = Boolean(isFlagged);
  if (reason) transaction.flaggedReason = reason;
  await transaction.save();

  await AuditLog.create({
    action: isFlagged ? "TRANSACTION_FLAGGED" : "TRANSACTION_UNFLAGGED",
    performedBy: req.user!._id,
    targetType: "Transaction",
    targetId: transaction._id.toString(),
    details: { isFlagged, reason },
  });

  res.status(200).json({
    success: true,
    message: `Transaction ${isFlagged ? "flagged as suspicious" : "cleared"}.`,
    transaction,
  });
};
