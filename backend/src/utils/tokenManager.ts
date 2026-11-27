import jwt, { SignOptions } from "jsonwebtoken";
import { IUser } from "../models/User";
import { SECURITY_CONFIG } from "../config/constants";

export interface AuthTokenPayload {
  id: string;
  role: string;
  email: string;
  type?: "access" | "refresh";
  iat?: number;
  exp?: number;
}

const getJwtSecret = (): string => {
  return (
    process.env.JWT_SECRET ||
    "super_secret_prime_bank_jwt_token_key_secure_2025_banking_production"
  );
};

/**
 * Signs a short-lived access JWT for authenticated API requests.
 */
export const signAccessToken = (user: IUser): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN ||
    SECURITY_CONFIG.JWT_EXPIRES_IN) as SignOptions["expiresIn"];

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      type: "access",
    },
    getJwtSecret(),
    { expiresIn }
  );
};

/**
 * Signs a longer-lived refresh JWT used to rotate access tokens.
 */
export const signRefreshToken = (user: IUser): string => {
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ||
    SECURITY_CONFIG.REFRESH_TOKEN_EXPIRES_IN) as SignOptions["expiresIn"];

  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      type: "refresh",
    },
    getJwtSecret(),
    { expiresIn }
  );
};

/**
 * Verifies and decodes a PrimeBank JWT using the configured secret.
 */
export const verifyAuthToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
};
