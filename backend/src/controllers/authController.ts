import { Response } from "express";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { AuditLog } from "../models/AuditLog";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/errorHandler";
import { generateAccountNumber } from "../utils/generate";
import { Notification } from "../models/Notification";
import { SECURITY_CONFIG } from "../config/constants";
import {
  signAccessToken,
  signRefreshToken,
  verifyAuthToken,
} from "../utils/tokenManager";

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    name,
    email,
    password,
    phone,
    address,
    accountType = "savings",
    initialDeposit = 1000,
    transactionPin = "1234",
  } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required.", 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError("An account with this email address already exists.", 400);
  }

  // Create Customer User
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    phone: phone || "+1 (555) 019-2834",
    address: address || "742 Evergreen Terrace, Springfield",
    role: "customer",
    status: "active",
    isVerified: true,
    lastLoginAt: new Date(),
  });

  const validAccountType = ["savings", "current", "business"].includes(accountType)
    ? accountType
    : "savings";

  // Automatically create their primary Bank Account
  const account = await Account.create({
    accountNumber: generateAccountNumber(),
    userId: user._id,
    accountType: validAccountType,
    balance: Number(initialDeposit) > 0 ? Number(initialDeposit) : 500,
    currency: "USD",
    status: "active",
    transactionPin: transactionPin || "1234",
    dailyTransferLimit: 10000,
    maxSingleTransferLimit: 5000,
    minBalance: 50,
  });

  await Promise.all([
    Notification.create({
      userId: user._id,
      title: "Welcome to PrimeBank!",
      message: `Your ${validAccountType} Account ${account.accountNumber} has been opened with an initial balance of $${account.balance}.`,
      type: "account",
    }),
    AuditLog.create({
      action: "USER_REGISTERED",
      performedBy: user._id,
      targetType: "User",
      targetId: user._id.toString(),
      details: { accountNumber: account.accountNumber, accountType: validAccountType },
      ipAddress: req.ip,
    }),
  ]);

  const token = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.status(201).json({
    success: true,
    message: "Registration successful. Welcome to PrimeBank!",
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
    },
    primaryAccount: {
      id: account._id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      status: account.status,
    },
  });
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide both email and password.", 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.status === "blocked") {
    throw new AppError("This account has been suspended by bank administration.", 403);
  }

  if (user.status === "deactivated") {
    throw new AppError("This account has been deactivated. Please contact support.", 403);
  }

  if (user.isLocked() && user.lockUntil) {
    const minutesLeft = Math.max(
      1,
      Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000)
    );
    throw new AppError(
      `Account temporarily locked due to failed attempts. Try again in ${minutesLeft} minute(s).`,
      423
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const attempts = (user.failedLoginAttempts || 0) + 1;
    user.failedLoginAttempts = attempts;
    if (attempts >= SECURITY_CONFIG.AUTH_LOCKOUT_THRESHOLD) {
      user.lockUntil = new Date(Date.now() + SECURITY_CONFIG.AUTH_LOCKOUT_DURATION_MS);
    }
    await user.save();

    await AuditLog.create({
      action: "LOGIN_FAILED",
      performedBy: user._id,
      targetType: "User",
      targetId: user._id.toString(),
      details: { attempts, locked: Boolean(user.lockUntil) },
      ipAddress: req.ip,
    });

    throw new AppError("Invalid email or password.", 401);
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  await AuditLog.create({
    action: "LOGIN_SUCCESS",
    performedBy: user._id,
    targetType: "User",
    targetId: user._id.toString(),
    details: { role: user.role },
    ipAddress: req.ip,
  });

  const token = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
    },
  });
};

export const refreshSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError("Refresh token is required.", 400);
  }

  let decoded;
  try {
    decoded = verifyAuthToken(refreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  if (decoded.type !== "refresh") {
    throw new AppError("Invalid token type supplied for refresh.", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user || user.status !== "active") {
    throw new AppError("User account is unavailable.", 401);
  }

  if (
    user.passwordChangedAt &&
    decoded.iat &&
    decoded.iat * 1000 < user.passwordChangedAt.getTime()
  ) {
    throw new AppError("Session invalidated after password update. Please log in again.", 401);
  }

  const token = signAccessToken(user);
  const nextRefreshToken = signRefreshToken(user);

  res.status(200).json({
    success: true,
    message: "Session refreshed successfully.",
    token,
    refreshToken: nextRefreshToken,
  });
};

export const logoutUser = async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user) {
    await AuditLog.create({
      action: "USER_LOGOUT",
      performedBy: req.user._id,
      targetType: "User",
      targetId: req.user._id.toString(),
      ipAddress: req.ip,
    });
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, address } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(name ? { name } : {}),
      ...(phone ? { phone } : {}),
      ...(address ? { address } : {}),
    },
    { new: true, runValidators: true }
  ).select("-password");

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    user: updatedUser,
  });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found", 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect.", 400);
  }

  user.password = newPassword;
  await user.save();

  await AuditLog.create({
    action: "PASSWORD_CHANGED",
    performedBy: user._id,
    targetType: "User",
    targetId: user._id.toString(),
    ipAddress: req.ip,
  });

  const token = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.status(200).json({
    success: true,
    message: "Password changed successfully.",
    token,
    refreshToken,
  });
};
