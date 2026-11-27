import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Validates request JSON bodies against a Zod schema and normalizes req.body.
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors
        .map((issue) => issue.message)
        .join(", ");

      res.status(400).json({
        success: false,
        message: message || "Invalid request payload.",
      });
      return;
    }

    req.body = result.data;
    next();
  };
};
