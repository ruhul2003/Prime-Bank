import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  performedBy: Schema.Types.ObjectId;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: String },
    details: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);