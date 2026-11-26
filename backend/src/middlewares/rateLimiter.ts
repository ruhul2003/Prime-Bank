import { Request, Response, NextFunction } from 'express';

const requestCounts = new Map<string, { count: number; expiresAt: number }>();

export function simpleRateLimiter(windowMs: number = 60000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    if (requestCounts.size > 1000) {
      for (const [key, entry] of requestCounts.entries()) {
        if (now > entry.expiresAt) requestCounts.delete(key);
      }
    }
    const clientRecord = requestCounts.get(ip);

    if (!clientRecord || now > clientRecord.expiresAt) {
      requestCounts.set(ip, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (clientRecord.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again shortly.',
      });
    }

    clientRecord.count += 1;
    next();
  };
}