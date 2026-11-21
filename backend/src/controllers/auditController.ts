import { Request, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { sendSuccess, sendError } from '../utils/responseHelper';

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(),
    ]);

    return sendSuccess(res, 'Audit logs fetched successfully', { logs, total, page, limit });
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to fetch audit logs', 500);
  }
}