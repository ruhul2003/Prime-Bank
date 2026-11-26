import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Attaches a unique x-request-id header and logs HTTP completion latency.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    console.log(`[${requestId}] [${method}] ${originalUrl} ${statusCode} - ${duration}ms`);
  });

  next();
}