import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  performedBy: Types.ObjectId;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, default: "" },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
