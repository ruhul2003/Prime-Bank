import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { UserRole } from "../models/User";

/**
 * Restricts route access to users whose role matches one of the allowed roles.
 */
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access." });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${roles.join(", ")}] roles. Your role is '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
};
