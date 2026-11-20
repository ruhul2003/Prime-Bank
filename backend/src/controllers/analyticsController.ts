import { Response } from "express";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import { Loan } from "../models/Loan";
import { DepositWithdrawRequest } from "../models/DepositWithdrawRequest";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/errorHandler";

export const getAdminAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  // Aggregate bank-wide totals
  const [
    totalCustomers,
    totalAccounts,
    accountsBalanceAgg,
    totalTransactions,
    depositsAgg,
    withdrawalsAgg,
    pendingLoansCount,
    activeLoansCount,
    pendingRequestsCount,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Account.countDocuments(),
    Account.aggregate([{ $group: { _id: null, totalBalance: { $sum: "$balance" } } }]),
    Transaction.countDocuments({ status: "completed" }),
    Transaction.aggregate([
      { $match: { type: "deposit", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      { $match: { type: "withdrawal", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Loan.countDocuments({ status: { $in: ["pending", "under_review"] } }),
    Loan.countDocuments({ status: "active" }),
    DepositWithdrawRequest.countDocuments({ status: "pending" }),
  ]);

  const totalBankBalance = accountsBalanceAgg.length > 0 ? accountsBalanceAgg[0].totalBalance : 0;
  const totalDeposits = depositsAgg.length > 0 ? depositsAgg[0].total : 0;
  const totalWithdrawals = withdrawalsAgg.length > 0 ? withdrawalsAgg[0].total : 0;

  // Account Type Distribution
  const accountDistributionAgg = await Account.aggregate([
    { $group: { _id: "$accountType", count: { $sum: 1 }, totalBalance: { $sum: "$balance" } } },
  ]);

  const accountDistribution = accountDistributionAgg.map((item) => ({
    type: item._id ? item._id.toUpperCase() : "OTHER",
    count: item.count,
    totalBalance: item.totalBalance,
  }));

  // Loan Approval Statistics
  const loanStatsAgg = await Loan.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$requestedAmount" } } },
  ]);

  const loanStats = loanStatsAgg.map((item) => ({
    status: item._id,
    count: item.count,
    amount: item.totalAmount,
  }));

  // Monthly Transaction Volume & Deposit vs Withdrawal (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyAgg = await Transaction.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          type: "$type",
        },
        volume: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyDataMap: Record<string, { month: string; deposit: number; withdrawal: number; transfer: number; totalVolume: number }> = {};

  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthlyDataMap[key] = {
      month: monthNames[d.getMonth()],
      deposit: 0,
      withdrawal: 0,
      transfer: 0,
      totalVolume: 0,
    };
  }

  monthlyAgg.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    if (monthlyDataMap[key]) {
      if (item._id.type === "deposit") monthlyDataMap[key].deposit += item.volume;
      else if (item._id.type === "withdrawal") monthlyDataMap[key].withdrawal += item.volume;
      else if (item._id.type === "transfer") monthlyDataMap[key].transfer += item.volume;
      monthlyDataMap[key].totalVolume += item.volume;
    }
  });

  const monthlyBankingActivity = Object.values(monthlyDataMap);

  res.status(200).json({
    success: true,
    overview: {
      totalCustomers,
      totalAccounts,
      totalBankBalance,
      totalDeposits,
      totalWithdrawals,
      totalTransactions,
      pendingLoansCount,
      activeLoansCount,
      pendingRequestsCount,
    },
    accountDistribution,
    loanStats,
    monthlyBankingActivity,
  });
};

export const getCustomerAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);

  const accounts = await Account.find({ userId: req.user._id });
  const accountIds = accounts.map((a) => a._id);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Deposits & Withdrawals totals
  const [depositsAgg, withdrawalsAgg, activeLoans] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          $or: [{ receiverAccountId: { $in: accountIds } }, { senderAccountId: { $in: accountIds } }],
          type: "deposit",
          status: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          senderAccountId: { $in: accountIds },
          type: { $in: ["withdrawal", "transfer"] },
          status: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Loan.find({ userId: req.user._id, status: "active" }),
  ]);

  const totalDeposits = depositsAgg.length > 0 ? depositsAgg[0].total : 0;
  const totalWithdrawals = withdrawalsAgg.length > 0 ? withdrawalsAgg[0].total : 0;

  // Transaction distribution by type
  const txnDistributionAgg = await Transaction.aggregate([
    {
      $match: {
        $or: [{ senderAccountId: { $in: accountIds } }, { receiverAccountId: { $in: accountIds } }],
        status: "completed",
      },
    },
    { $group: { _id: "$type", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
  ]);

  const transactionDistribution = txnDistributionAgg.map((item) => ({
    name: item._id ? item._id.replace("_", " ").toUpperCase() : "OTHER",
    value: item.totalAmount,
    count: item.count,
  }));

  // Monthly Spending & Deposit History
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const userMonthlyAgg = await Transaction.aggregate([
    {
      $match: {
        $or: [{ senderAccountId: { $in: accountIds } }, { receiverAccountId: { $in: accountIds } }],
        status: "completed",
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          type: "$type",
        },
        amount: { $sum: "$amount" },
      },
    },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyMap: Record<string, { month: string; deposit: number; spending: number }> = {};

  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthlyMap[key] = {
      month: monthNames[d.getMonth()],
      deposit: 0,
      spending: 0,
    };
  }

  userMonthlyAgg.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    if (monthlyMap[key]) {
      if (item._id.type === "deposit" || item._id.type === "loan_disbursement") {
        monthlyMap[key].deposit += item.amount;
      } else {
        monthlyMap[key].spending += item.amount;
      }
    }
  });

  res.status(200).json({
    success: true,
    summary: {
      totalBalance,
      totalDeposits,
      totalWithdrawals,
      accountsCount: accounts.length,
      activeLoansCount: activeLoans.length,
      totalLoanDebt: activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0),
    },
    transactionDistribution,
    monthlyActivity: Object.values(monthlyMap),
  });
};
