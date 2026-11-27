export type UserRole = "admin" | "staff" | "customer";
export type UserStatus = "active" | "deactivated" | "blocked";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address?: string;
  status: UserStatus;
  isVerified: boolean;
  avatar?: string;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthSessionResponse {
  success: boolean;
  message: string;
  token: string;
  refreshToken?: string;
  user: User;
}

export type AccountType = "savings" | "current" | "business";
export type AccountStatus = "active" | "frozen" | "closed";

export interface BankAccount {
  _id: string;
  id?: string;
  accountNumber: string;
  userId: string | User;
  accountType: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  dailyTransferLimit: number;
  maxSingleTransferLimit: number;
  minBalance: number;
  createdAt: string;
}

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "loan_disbursement"
  | "loan_repayment";

export type TransactionStatus = "completed" | "pending" | "failed" | "reversed";

export interface Transaction {
  _id: string;
  transactionId: string;
  senderAccountId?: BankAccount | string;
  senderUserId?: User | string;
  senderAccountNumber?: string;
  receiverAccountId?: BankAccount | string;
  receiverUserId?: User | string;
  receiverAccountNumber?: string;
  type: TransactionType;
  amount: number;
  fee: number;
  status: TransactionStatus;
  description: string;
  reference: string;
  isFlagged?: boolean;
  flaggedReason?: string;
  createdAt: string;
}

export type LoanType = "personal" | "business" | "home" | "education";
export type LoanStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "active"
  | "completed";

export interface RepaymentInstallment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: "pending" | "paid";
  paidDate?: string;
  transactionId?: string;
}

export interface Loan {
  _id: string;
  loanId: string;
  userId: User | string;
  accountId: BankAccount | string;
  loanType: LoanType;
  requestedAmount: number;
  approvedAmount: number;
  interestRate: number;
  durationMonths: number;
  monthlyIncome: number;
  employmentStatus: string;
  description: string;
  status: LoanStatus;
  remainingBalance: number;
  monthlyInstallment: number;
  staffNotes?: string;
  forwardedByStaff?: boolean;
  reviewedByStaff?: User | string;
  approvedBy?: User | string;
  rejectionReason?: string;
  disbursementTransactionId?: string;
  repaymentSchedule: RepaymentInstallment[];
  createdAt: string;
}

export interface DepositWithdrawRequest {
  _id: string;
  requestId: string;
  userId: User | string;
  accountId: BankAccount | string;
  type: "deposit" | "withdrawal";
  amount: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  reviewNotes?: string;
  reviewedBy?: User | string;
  reviewedAt?: string;
  transactionId?: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "transaction" | "loan" | "security" | "account" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface AdminAnalytics {
  overview: {
    totalCustomers: number;
    totalAccounts: number;
    totalBankBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalTransactions: number;
    pendingLoansCount: number;
    activeLoansCount: number;
    pendingRequestsCount: number;
  };
  accountDistribution: Array<{ type: string; count: number; totalBalance: number }>;
  loanStats: Array<{ status: string; count: number; amount: number }>;
  monthlyBankingActivity: Array<{
    month: string;
    deposit: number;
    withdrawal: number;
    transfer: number;
    totalVolume: number;
  }>;
}

export interface CustomerAnalytics {
  summary: {
    totalBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    accountsCount: number;
    activeLoansCount: number;
    totalLoanDebt: number;
  };
  transactionDistribution: Array<{ name: string; value: number; count: number }>;
  monthlyActivity: Array<{ month: string; deposit: number; spending: number }>;
}
