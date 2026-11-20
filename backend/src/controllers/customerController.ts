import { Response } from "express";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import { Loan } from "../models/Loan";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/errorHandler";
import { generateAccountNumber } from "../utils/generate";
import { AuditLog } from "../models/AuditLog";
import { Notification } from "../models/Notification";

export const getAllCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 20, search, status } = req.query;

  const query: any = { role: "customer" };
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [customers, total] = await Promise.all([
    User.find(query).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  // Attach accounts count and aggregate balances for each customer
  const enrichedCustomers = await Promise.all(
    customers.map(async (cust) => {
      const accounts = await Account.find({ userId: cust._id });
      const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
      return {
        ...cust.toObject(),
        accountsCount: accounts.length,
        totalBalance,
      };
    })
  );

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    customers: enrichedCustomers,
  });
};

export const getCustomerDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const customer = await User.findById(id).select("-password");
  if (!customer) throw new AppError("Customer not found", 404);

  const [accounts, loans] = await Promise.all([
    Account.find({ userId: customer._id }),
    Loan.find({ userId: customer._id }).sort({ createdAt: -1 }),
  ]);

  const accountIds = accounts.map((a) => a._id);
  const transactions = await Transaction.find({
    $or: [{ senderAccountId: { $in: accountIds } }, { receiverAccountId: { $in: accountIds } }],
  })
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    customer,
    accounts,
    loans,
    recentTransactions: transactions,
  });
};

export const updateCustomerStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, reason } = req.body; // 'active', 'deactivated', 'blocked'
  if (!req.user) throw new AppError("Unauthorized", 401);

  if (!["active", "deactivated", "blocked"].includes(status)) {
    throw new AppError("Invalid status value.", 400);
  }

  const customer = await User.findById(id);
  if (!customer) throw new AppError("Customer not found", 404);

  if (customer.role === "admin" && req.user.role !== "admin") {
    throw new AppError("Forbidden: Cannot alter admin accounts.", 403);
  }

  const prevStatus = customer.status;
  customer.status = status;
  await customer.save();

  // If customer is blocked, freeze all their bank accounts automatically
  if (status === "blocked") {
    await Account.updateMany({ userId: customer._id }, { status: "frozen" });
  } else if (status === "active" && prevStatus === "blocked") {
    await Account.updateMany({ userId: customer._id, status: "frozen" }, { status: "active" });
  }

  await AuditLog.create({
    action: `CUSTOMER_STATUS_${status.toUpperCase()}`,
    performedBy: req.user._id,
    targetType: "User",
    targetId: customer._id.toString(),
    details: { from: prevStatus, to: status, reason: reason || "Administrative update" },
  });

  await Notification.create({
    userId: customer._id,
    title: `Account Status Changed: ${status.toUpperCase()}`,
    message: `Your customer profile status has been marked as ${status}.${reason ? ` Details: ${reason}` : ""}`,
    type: "security",
  });

  res.status(200).json({
    success: true,
    message: `Customer status updated to ${status}.`,
    customer,
  });
};

export const registerCustomerByStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, phone, address, accountType = "savings", initialDeposit = 500 } = req.body;
  if (!req.user) throw new AppError("Unauthorized", 401);

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required.", 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("A user with this email already exists.", 400);
  }

  const customer = await User.create({
    name,
    email,
    password,
    phone: phone || "+1 (555) 302-8819",
    address: address || "452 Financial Way, Metropolis",
    role: "customer",
    status: "active",
    isVerified: true,
  });

  const account = await Account.create({
    accountNumber: generateAccountNumber(),
    userId: customer._id,
    accountType,
    balance: Number(initialDeposit) > 0 ? Number(initialDeposit) : 0,
    status: "active",
    transactionPin: "1234",
    dailyTransferLimit: 10000,
    maxSingleTransferLimit: 5000,
    minBalance: 50,
  });

  await AuditLog.create({
    action: "CUSTOMER_ONBOARDED_BY_STAFF",
    performedBy: req.user._id,
    targetType: "User",
    targetId: customer._id.toString(),
    details: { email: customer.email, initialAccount: account.accountNumber, balance: account.balance },
  });

  await Notification.create({
    userId: customer._id,
    title: "Welcome to PrimeBank!",
    message: `Account opened by customer support. Account number: ${account.accountNumber}. Initial PIN is 1234.`,
    type: "account",
  });

  res.status(201).json({
    success: true,
    message: "New customer registered and bank account issued.",
    customer,
    account,
  });
};
