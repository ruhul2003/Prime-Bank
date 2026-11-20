import mongoose, { Document, Schema, Types } from "mongoose";

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "loan_disbursement"
  | "loan_repayment";

export type TransactionStatus = "completed" | "pending" | "failed" | "reversed";

export interface ITransaction extends Document {
  transactionId: string;
  senderAccountId?: Types.ObjectId;
  senderUserId?: Types.ObjectId;
  receiverAccountId?: Types.ObjectId;
  receiverUserId?: Types.ObjectId;
  senderAccountNumber?: string;
  receiverAccountNumber?: string;
  type: TransactionType;
  amount: number;
  fee: number;
  status: TransactionStatus;
  description: string;
  reference: string;
  isFlagged: boolean;
  flaggedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    senderAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      index: true,
    },
    senderUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    receiverAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      index: true,
    },
    receiverUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    senderAccountNumber: {
      type: String,
    },
    receiverAccountNumber: {
      type: String,
    },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer", "loan_disbursement", "loan_repayment"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    fee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "reversed"],
      default: "completed",
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    reference: {
      type: String,
      default: "",
    },
    isFlagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    flaggedReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);
