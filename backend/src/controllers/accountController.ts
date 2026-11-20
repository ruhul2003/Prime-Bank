import { Response } from "express";
import { Account, IAccount } from "../models/Account";
import { User } from "../models/User";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/errorHandler";
import { generateAccountNumber } from "../utils/generate";
import { Notification } from "../models/Notification";
import { AuditLog } from "../models/AuditLog";

export const createAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId, accountType, initialDeposit = 0, transactionPin = "1234", dailyLimit, maxSingleLimit, minBalance } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  // If customer is creating, it must be for themselves. If admin or staff, they can specify userId
  let targetUserId = req.user._id;
  if (req.user.role === "admin" || req.user.role === "staff") {
    if (userId) {
      targetUserId = userId;
    }
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError("Target customer not found.", 404);
  }

  const validTypes = ["savings", "current", "business"];
  if (!validTypes.includes(accountType)) {
    throw new AppError("Invalid account type. Allowed: savings, current, business.", 400);
  }

  const newAccount = await Account.create({
    accountNumber: generateAccountNumber(),
    userId: targetUser._id,
    accountType,
    balance: Math.max(0, Number(initialDeposit)),
    status: "active",
    transactionPin: transactionPin || "1234",
    dailyTransferLimit: dailyLimit || (accountType === "business" ? 50000 : 10000),
    maxSingleTransferLimit: maxSingleLimit || (accountType === "business" ? 25000 : 5000),
    minBalance: minBalance !== undefined ? minBalance : (accountType === "business" ? 250 : 50),
  });

  // Audit log
  await AuditLog.create({
    action: "ACCOUNT_CREATED",
    performedBy: req.user._id,
    targetType: "Account",
    targetId: newAccount._id.toString(),
    details: { accountNumber: newAccount.accountNumber, accountType, balance: newAccount.balance },
  });

  // Notify customer
  await Notification.create({
    userId: targetUser._id,
    title: "New Account Opened",
    message: `Your new ${accountType.toUpperCase()} Account ${newAccount.accountNumber} is active with balance $${newAccount.balance}.`,
    type: "account",
  });

  res.status(201).json({
    success: true,
    message: "Bank account created successfully.",
    account: newAccount,
  });
};

export const getMyAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);

  const accounts = await Account.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: accounts.length,
    accounts,
  });
};

export const getAllAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 20, search, type, status } = req.query;

  const query: any = {};
  if (type) query.accountType = type;
  if (status) query.status = status;
  if (search) {
    query.accountNumber = { $regex: search, $options: "i" };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [accounts, total] = await Promise.all([
    Account.find(query)
      .populate("userId", "name email phone role status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Account.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    accounts,
  });
};

export const getAccountById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const account = await Account.findById(id).populate("userId", "name email phone role status");
  if (!account) throw new AppError("Account not found", 404);

  // If customer, ensure ownership
  if (req.user?.role === "customer" && account.userId._id.toString() !== req.user._id.toString()) {
    throw new AppError("Access denied. You cannot view other customers' accounts.", 403);
  }

  res.status(200).json({
    success: true,
    account,
  });
};

export const freezeUnfreezeAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, reason } = req.body; // 'active' or 'frozen'

  if (!["active", "frozen", "closed"].includes(status)) {
    throw new AppError("Status must be 'active', 'frozen', or 'closed'.", 400);
  }

  const account = await Account.findById(id).populate("userId", "name email");
  if (!account) throw new AppError("Account not found", 404);

  const prevStatus = account.status;
  account.status = status;
  await account.save();

  await AuditLog.create({
    action: `ACCOUNT_${status.toUpperCase()}`,
    performedBy: req.user!._id,
    targetType: "Account",
    targetId: account._id.toString(),
    details: { from: prevStatus, to: status, reason: reason || "Administrative action" },
  });

  await Notification.create({
    userId: account.userId._id,
    title: `Account ${status === "frozen" ? "Frozen" : "Updated"}`,
    message: `Your account ${account.accountNumber} status has been changed to ${status.toUpperCase()}.${reason ? ` Reason: ${reason}` : ""}`,
    type: "security",
  });

  res.status(200).json({
    success: true,
    message: `Account status updated to ${status}.`,
    account,
  });
};

export const setAccountLimits = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { dailyTransferLimit, maxSingleTransferLimit, minBalance } = req.body;

  const account = await Account.findById(id);
  if (!account) throw new AppError("Account not found", 404);

  if (dailyTransferLimit !== undefined) account.dailyTransferLimit = Number(dailyTransferLimit);
  if (maxSingleTransferLimit !== undefined) account.maxSingleTransferLimit = Number(maxSingleTransferLimit);
  if (minBalance !== undefined) account.minBalance = Number(minBalance);

  await account.save();

  await AuditLog.create({
    action: "ACCOUNT_LIMITS_UPDATED",
    performedBy: req.user!._id,
    targetType: "Account",
    targetId: account._id.toString(),
    details: { dailyTransferLimit, maxSingleTransferLimit, minBalance },
  });

  res.status(200).json({
    success: true,
    message: "Account transaction limits updated successfully.",
    account,
  });
};

export const updatePin = async (req: AuthRequest, res: Response): Promise<void> => {
  const { accountId, currentPin, newPin } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  if (!newPin || newPin.length < 4 || newPin.length > 6) {
    throw new AppError("PIN must be 4 to 6 digits.", 400);
  }

  const account = await Account.findById(accountId);
  if (!account) throw new AppError("Account not found", 404);

  // If customer, verify ownership and current pin
  if (req.user.role === "customer") {
    if (account.userId.toString() !== req.user._id.toString()) {
      throw new AppError("Unauthorized access to account.", 403);
    }
    const isPinValid = await account.comparePin(currentPin);
    if (!isPinValid) {
      throw new AppError("Current transaction PIN is incorrect.", 400);
    }
  }

  account.transactionPin = newPin;
  await account.save();

  await Notification.create({
    userId: account.userId,
    title: "Transaction PIN Changed",
    message: `The security PIN for account ${account.accountNumber} was updated successfully.`,
    type: "security",
  });

  res.status(200).json({
    success: true,
    message: "Transaction PIN changed successfully.",
  });
};
