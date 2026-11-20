import { Response } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { Account } from "../models/Account";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/errorHandler";
import { generateAccountNumber } from "../utils/generate";
import { Notification } from "../models/Notification";

const signToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || "super_secret_prime_bank_jwt_token_key_secure_2025_banking_production",
    { expiresIn: "7d" }
  );
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, phone, address, initialDeposit = 1000, transactionPin = "1234" } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required.", 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email address already exists.", 400);
  }

  // Create Customer User
  const user = await User.create({
    name,
    email,
    password,
    phone: phone || "+1 (555) 019-2834",
    address: address || "742 Evergreen Terrace, Springfield",
    role: "customer",
    status: "active",
    isVerified: true,
  });

  // Automatically create their primary Savings Account
  const account = await Account.create({
    accountNumber: generateAccountNumber(),
    userId: user._id,
    accountType: "savings",
    balance: Number(initialDeposit) > 0 ? Number(initialDeposit) : 500,
    currency: "USD",
    status: "active",
    transactionPin: transactionPin || "1234",
    dailyTransferLimit: 10000,
    maxSingleTransferLimit: 5000,
    minBalance: 50,
  });

  // Welcome Notification
  await Notification.create({
    userId: user._id,
    title: "Welcome to PrimeBank!",
    message: `Your Savings Account ${account.accountNumber} has been opened with an initial balance of $${account.balance}. Default PIN is set to 1234.`,
    type: "account",
  });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    message: "Registration successful. Welcome to PrimeBank!",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
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

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.status === "blocked") {
    throw new AppError("This account has been suspended by bank administration.", 403);
  }

  if (user.status === "deactivated") {
    throw new AppError("This account has been deactivated. Please contact support.", 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = signToken(user);

  res.status(200).json({
    success: true,
    message: "Logged in successfully.",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled,
    },
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

  res.status(200).json({
    success: true,
    message: "Password changed successfully.",
  });
};
