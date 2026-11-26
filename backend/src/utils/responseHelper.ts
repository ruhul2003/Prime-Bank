import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: string;
}

export function sendSuccess<T>(res: Response, message: string, data?: T, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  const safeLimit = limit > 0 ? limit : 1;
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      page,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  });
}

export function sendError(res: Response, message: string, statusCode = 400, error?: string) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || message,
  });
}