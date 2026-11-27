import { Request, Response, NextFunction } from 'express';

const requestCounts = new Map<string, { count: number; expiresAt: number }>();

export function simpleRateLimiter(windowMs: number = 60000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'test') return next();

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
      const retryAfterSec = Math.max(1, Math.ceil((clientRecord.expiresAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again shortly.',
      });
    }

    clientRecord.count += 1;
    next();
  };
}

/**
 * Stricter rate limiter scoped to authentication endpoints by client IP and email.
 */
export function authRateLimiter(windowMs: number = 15 * 60 * 1000, maxAttempts: number = 25) {
  const authBuckets = new Map<string, { count: number; expiresAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'test') return next();

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const key = email ? `${ip}:${email}` : ip;
    const now = Date.now();

    if (authBuckets.size > 1000) {
      for (const [bucketKey, entry] of authBuckets.entries()) {
        if (now > entry.expiresAt) authBuckets.delete(bucketKey);
      }
    }

    const record = authBuckets.get(key);
    if (!record || now > record.expiresAt) {
      authBuckets.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (record.count >= maxAttempts) {
      const retryAfterSec = Math.max(1, Math.ceil((record.expiresAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please wait before trying again.',
      });
    }

    record.count += 1;
    next();
  };
}