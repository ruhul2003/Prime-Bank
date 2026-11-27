import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "staff" | "customer";
export type UserStatus = "active" | "deactivated" | "blocked";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  address?: string;
  status: UserStatus;
  isVerified: boolean;
  avatar?: string;
  twoFactorEnabled: boolean;
  failedLoginAttempts: number;
  lockUntil?: Date | null;
  lastLoginAt?: Date | null;
  passwordChangedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
  isLocked(): boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "staff", "customer"],
      default: "customer",
      index: true,
    },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "deactivated", "blocked"],
      default: "active",
      index: true,
    },
    isVerified: { type: Boolean, default: true },
    avatar: { type: String, default: "" },
    twoFactorEnabled: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.isLocked = function (): boolean {
  return Boolean(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

export const User = mongoose.model<IUser>("User", UserSchema);
