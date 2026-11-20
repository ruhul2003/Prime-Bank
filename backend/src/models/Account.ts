import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

export type AccountType = "savings" | "current" | "business";
export type AccountStatus = "active" | "frozen" | "closed";

export interface IAccount extends Document {
  accountNumber: string;
  userId: Types.ObjectId;
  accountType: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  transactionPin: string;
  dailyTransferLimit: number;
  maxSingleTransferLimit: number;
  minBalance: number;
  createdAt: Date;
  updatedAt: Date;
  comparePin(pin: string): Promise<boolean>;
}

const AccountSchema = new Schema<IAccount>(
  {
    accountNumber: {
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
    accountType: {
      type: String,
      enum: ["savings", "current", "business"],
      required: true,
      default: "savings",
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["active", "frozen", "closed"],
      default: "active",
      index: true,
    },
    transactionPin: {
      type: String,
      required: true,
    },
    dailyTransferLimit: {
      type: Number,
      default: 10000,
    },
    maxSingleTransferLimit: {
      type: Number,
      default: 5000,
    },
    minBalance: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

AccountSchema.pre("save", async function (next) {
  if (!this.isModified("transactionPin")) return next();
  const salt = await bcrypt.genSalt(10);
  this.transactionPin = await bcrypt.hash(this.transactionPin, salt);
  next();
});

AccountSchema.methods.comparePin = async function (pin: string): Promise<boolean> {
  return bcrypt.compare(pin, this.transactionPin);
};

export const Account = mongoose.model<IAccount>("Account", AccountSchema);
