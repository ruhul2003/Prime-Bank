import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/User";
import { verifyAuthToken } from "../utils/tokenManager";

export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Verifies the Bearer JWT, token freshness, and attaches the active user record to the request.
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Authentication required. Missing token." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAuthToken(token);

    if (decoded.type && decoded.type !== "access") {
      res.status(401).json({ success: false, message: "Invalid token type for API access." });
      return;
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401).json({ success: false, message: "User account no longer exists." });
      return;
    }

    if (
      user.passwordChangedAt &&
      decoded.iat &&
      decoded.iat * 1000 < user.passwordChangedAt.getTime()
    ) {
      res.status(401).json({
        success: false,
        message: "Session expired after password change. Please log in again.",
      });
      return;
    }

    if (user.status === "blocked") {
      res.status(403).json({
        success: false,
        message: "Your account has been suspended for security review. Contact support.",
      });
      return;
    }

    if (user.status === "deactivated") {
      res.status(403).json({
        success: false,
        message: "Account deactivated. Please contact bank administration.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({ success: false, message: "Invalid or expired session token." });
  }
};
