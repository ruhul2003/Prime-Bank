import mongoose, { Document, Schema, Types } from "mongoose";

export type RequestType = "deposit" | "withdrawal";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface IDepositWithdrawRequest extends Document {
  requestId: string;
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  type: RequestType;
  amount: number;
  description: string;
  status: RequestStatus;
  reviewNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepositWithdrawRequestSchema = new Schema<IDepositWithdrawRequest>(
  {
    requestId: {
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
    type: {
      type: String,
      enum: ["deposit", "withdrawal"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewNotes: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    transactionId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const DepositWithdrawRequest = mongoose.model<IDepositWithdrawRequest>(
  "DepositWithdrawRequest",
  DepositWithdrawRequestSchema
);
