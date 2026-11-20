import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import { Loan } from "../models/Loan";
import { DepositWithdrawRequest } from "../models/DepositWithdrawRequest";
import { Notification } from "../models/Notification";
import { AuditLog } from "../models/AuditLog";
import { generateTransactionId } from "./generate";

dotenv.config();

export const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/PrimeBankDB";
    await mongoose.connect(uri);
    console.log("[PrimeBank Seeder] Connected to MongoDB.");

    // Clear previous data
    await Promise.all([
      User.deleteMany({}),
      Account.deleteMany({}),
      Transaction.deleteMany({}),
      Loan.deleteMany({}),
      DepositWithdrawRequest.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log("[PrimeBank Seeder] Cleared old banking records.");

    // 1. Create Core Users
    // Admin
    const admin = await User.create({
      name: "Alexander Vance",
      email: "admin@primebank.com",
      password: "AdminPassword123!",
      role: "admin",
      phone: "+1 (800) 555-0101",
      address: "100 Wall Street, Suite 4200, New York, NY",
      status: "active",
      isVerified: true,
    });

    // Staff
    const staff = await User.create({
      name: "Elena Rostova",
      email: "staff@primebank.com",
      password: "StaffPassword123!",
      role: "staff",
      phone: "+1 (800) 555-0102",
      address: "245 Park Avenue, New York, NY",
      status: "active",
      isVerified: true,
    });

    // Customer 1: Main Demo User (Robert Sterling)
    const customer1 = await User.create({
      name: "Robert Sterling",
      email: "customer@primebank.com",
      password: "CustomerPassword123!",
      role: "customer",
      phone: "+1 (212) 555-0199",
      address: "740 Park Avenue, Apt 11B, New York, NY",
      status: "active",
      isVerified: true,
    });

    // Customer 2: Sarah Jenkins
    const customer2 = await User.create({
      name: "Dr. Sarah Jenkins",
      email: "sarah.jenkins@gmail.com",
      password: "CustomerPassword123!",
      role: "customer",
      phone: "+1 (415) 555-0144",
      address: "580 California St, San Francisco, CA",
      status: "active",
      isVerified: true,
    });

    // Customer 3: Marcus Wright
    const customer3 = await User.create({
      name: "Marcus Wright",
      email: "marcus.wright@techcorp.io",
      password: "CustomerPassword123!",
      role: "customer",
      phone: "+1 (312) 555-0188",
      address: "233 S Wacker Dr, Chicago, IL",
      status: "active",
      isVerified: true,
    });

    console.log("[PrimeBank Seeder] Created users: Admin, Staff, Customers.");

    // 2. Create Bank Accounts
    // Customer 1 Accounts
    const c1Savings = await Account.create({
      accountNumber: "401000000001",
      userId: customer1._id,
      accountType: "savings",
      balance: 24850.75,
      currency: "USD",
      status: "active",
      transactionPin: "1234",
      dailyTransferLimit: 15000,
      maxSingleTransferLimit: 5000,
      minBalance: 100,
    });

    const c1Current = await Account.create({
      accountNumber: "402000000002",
      userId: customer1._id,
      accountType: "current",
      balance: 8420.5,
      currency: "USD",
      status: "active",
      transactionPin: "1234",
      dailyTransferLimit: 25000,
      maxSingleTransferLimit: 10000,
      minBalance: 50,
    });

    const c1Business = await Account.create({
      accountNumber: "403000000003",
      userId: customer1._id,
      accountType: "business",
      balance: 62300.0,
      currency: "USD",
      status: "active",
      transactionPin: "1234",
      dailyTransferLimit: 100000,
      maxSingleTransferLimit: 50000,
      minBalance: 500,
    });

    // Customer 2 Account
    const c2Savings = await Account.create({
      accountNumber: "401000000004",
      userId: customer2._id,
      accountType: "savings",
      balance: 14200.0,
      currency: "USD",
      status: "active",
      transactionPin: "1234",
      dailyTransferLimit: 10000,
      maxSingleTransferLimit: 5000,
      minBalance: 100,
    });

    // Customer 3 Account
    const c3Business = await Account.create({
      accountNumber: "403000000005",
      userId: customer3._id,
      accountType: "business",
      balance: 118400.0,
      currency: "USD",
      status: "active",
      transactionPin: "1234",
      dailyTransferLimit: 100000,
      maxSingleTransferLimit: 50000,
      minBalance: 500,
    });

    console.log("[PrimeBank Seeder] Created bank accounts.");

    // 3. Transactions History
    const now = new Date();
    const transactionsData = [
      {
        transactionId: "TXN-PRIME-001",
        receiverAccountId: c1Savings._id,
        receiverUserId: customer1._id,
        receiverAccountNumber: c1Savings.accountNumber,
        type: "deposit",
        amount: 15000,
        fee: 0,
        status: "completed",
        description: "Initial payroll wire transfer",
        reference: "DEP-WIRE-9921",
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        transactionId: "TXN-PRIME-002",
        receiverAccountId: c1Current._id,
        receiverUserId: customer1._id,
        receiverAccountNumber: c1Current.accountNumber,
        type: "deposit",
        amount: 8000,
        fee: 0,
        status: "completed",
        description: "Direct deposit from Global Tech Corp",
        reference: "DEP-DIR-1120",
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        transactionId: "TXN-PRIME-003",
        senderAccountId: c1Savings._id,
        senderUserId: customer1._id,
        senderAccountNumber: c1Savings.accountNumber,
        receiverAccountId: c2Savings._id,
        receiverUserId: customer2._id,
        receiverAccountNumber: c2Savings.accountNumber,
        type: "transfer",
        amount: 1250,
        fee: 2,
        status: "completed",
        description: "Consulting fee payment to Dr. Sarah Jenkins",
        reference: "TRF-CJ-4019",
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        transactionId: "TXN-PRIME-004",
        senderAccountId: c1Current._id,
        senderUserId: customer1._id,
        senderAccountNumber: c1Current.accountNumber,
        type: "withdrawal",
        amount: 500,
        fee: 0,
        status: "completed",
        description: "ATM Cash Withdrawal - Midtown Manhattan",
        reference: "WTH-ATM-0491",
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        transactionId: "TXN-PRIME-005",
        receiverAccountId: c1Business._id,
        receiverUserId: customer1._id,
        receiverAccountNumber: c1Business.accountNumber,
        type: "deposit",
        amount: 60000,
        fee: 0,
        status: "completed",
        description: "Institutional client invoice settlement",
        reference: "DEP-INV-7731",
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        transactionId: "TXN-PRIME-006",
        senderAccountId: c1Business._id,
        senderUserId: customer1._id,
        senderAccountNumber: c1Business.accountNumber,
        receiverAccountId: c3Business._id,
        receiverUserId: customer3._id,
        receiverAccountNumber: c3Business.accountNumber,
        type: "transfer",
        amount: 12500,
        fee: 2,
        status: "completed",
        description: "Server infrastructure supplier payment",
        reference: "TRF-SUP-8812",
        isFlagged: true,
        flaggedReason: "High-value transfer exceeding $10,000 threshold.",
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    await Transaction.insertMany(transactionsData);
    console.log("[PrimeBank Seeder] Created transaction records.");

    // 4. Loans
    // Active Home Loan for Customer 1
    const homeLoanSchedule = [];
    for (let i = 1; i <= 36; i++) {
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + i);
      homeLoanSchedule.push({
        installmentNumber: i,
        dueDate,
        amount: 875.5,
        status: i <= 3 ? "paid" : "pending",
        ...(i <= 3 ? { paidDate: new Date(now.getTime() - (4 - i) * 30 * 24 * 60 * 60 * 1000) } : {}),
      });
    }

    await Loan.create({
      loanId: "LN-849102",
      userId: customer1._id,
      accountId: c1Savings._id,
      loanType: "home",
      requestedAmount: 30000,
      approvedAmount: 30000,
      interestRate: 4.5,
      durationMonths: 36,
      monthlyIncome: 12500,
      employmentStatus: "Full-Time Executive",
      description: "Apartment remodeling and interior upgrade",
      status: "active",
      remainingBalance: 27140.0,
      monthlyInstallment: 875.5,
      approvedBy: admin._id,
      disbursementTransactionId: "TXN-PRIME-DISB-01",
      repaymentSchedule: homeLoanSchedule,
    });

    // Pending Business Loan for Customer 1
    const businessLoanSchedule = [];
    for (let i = 1; i <= 24; i++) {
      const dueDate = new Date(now);
      dueDate.setMonth(dueDate.getMonth() + i);
      businessLoanSchedule.push({
        installmentNumber: i,
        dueDate,
        amount: 1125.0,
        status: "pending",
      });
    }

    await Loan.create({
      loanId: "LN-928411",
      userId: customer1._id,
      accountId: c1Business._id,
      loanType: "business",
      requestedAmount: 25000,
      approvedAmount: 0,
      interestRate: 6.0,
      durationMonths: 24,
      monthlyIncome: 18000,
      employmentStatus: "Business Owner",
      description: "AI Cloud computing infrastructure expansion",
      status: "under_review",
      remainingBalance: 27000.0,
      monthlyInstallment: 1125.0,
      forwardedByStaff: true,
      reviewedByStaff: staff._id,
      staffNotes: "Credit history verified; annual enterprise recurring revenue exceeds $200k. Recommended for approval.",
      repaymentSchedule: businessLoanSchedule,
    });

    // 5. Deposit and Withdrawal Requests
    await DepositWithdrawRequest.create([
      {
        requestId: "REQ-101",
        userId: customer1._id,
        accountId: c1Savings._id,
        type: "deposit",
        amount: 5000,
        description: "Quarterly bonus check deposit",
        status: "pending",
      },
      {
        requestId: "REQ-102",
        userId: customer2._id,
        accountId: c2Savings._id,
        type: "withdrawal",
        amount: 1500,
        description: "Branch counter cash pickup",
        status: "pending",
      },
    ]);

    // 6. Notifications
    await Notification.create([
      {
        userId: customer1._id,
        title: "Account Credited",
        message: "Your Savings Account 401000000001 has been credited with $15,000.00.",
        type: "transaction",
        isRead: true,
      },
      {
        userId: customer1._id,
        title: "Loan Application Under Review",
        message: "Your Business Loan LN-928411 was reviewed by Elena Rostova and forwarded to Executive Underwriting.",
        type: "loan",
        isRead: false,
      },
    ]);

    console.log("[PrimeBank Seeder] Database seeded successfully with demo records!");
    process.exit(0);
  } catch (error) {
    console.error("[PrimeBank Seeder] Error seeding database:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
