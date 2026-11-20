import mongoose, { Document, Schema, Types } from "mongoose";

export type LoanType = "personal" | "business" | "home" | "education";
export type LoanStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "active"
  | "completed";

export interface IRepaymentSchedule {
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  status: "pending" | "paid";
  paidDate?: Date;
  transactionId?: string;
}

export interface ILoan extends Document {
  loanId: string;
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  loanType: LoanType;
  requestedAmount: number;
  approvedAmount: number;
  interestRate: number; // annual percentage e.g. 6.5
  durationMonths: number;
  monthlyIncome: number;
  employmentStatus: string;
  description: string;
  status: LoanStatus;
  remainingBalance: number;
  monthlyInstallment: number;
  staffNotes?: string;
  forwardedByStaff: boolean;
  reviewedByStaff?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  rejectionReason?: string;
  disbursementTransactionId?: string;
  repaymentSchedule: IRepaymentSchedule[];
  createdAt: Date;
  updatedAt: Date;
}

const RepaymentScheduleSchema = new Schema<IRepaymentSchedule>(
  {
    installmentNumber: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paidDate: { type: Date },
    transactionId: { type: String },
  },
  { _id: false }
);

const LoanSchema = new Schema<ILoan>(
  {
    loanId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    loanType: {
      type: String,
      enum: ["personal", "business", "home", "education"],
      required: true,
      index: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
      min: 500,
    },
    approvedAmount: {
      type: Number,
      default: 0,
    },
    interestRate: {
      type: Number,
      default: 6.5,
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 3,
      max: 120,
    },
    monthlyIncome: {
      type: Number,
      required: true,
    },
    employmentStatus: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "active", "completed"],
      default: "pending",
      index: true,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
    monthlyInstallment: {
      type: Number,
      default: 0,
    },
    staffNotes: {
      type: String,
      default: "",
    },
    forwardedByStaff: {
      type: Boolean,
      default: false,
    },
    reviewedByStaff: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    disbursementTransactionId: {
      type: String,
    },
    repaymentSchedule: [RepaymentScheduleSchema],
  },
  { timestamps: true }
);

export const Loan = mongoose.model<ILoan>("Loan", LoanSchema);
