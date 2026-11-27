import { Router } from "express";
import {
  register,
  login,
  refreshSession,
  logoutUser,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { validateBody } from "../middlewares/validateRequest";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  refreshTokenSchema,
} from "../utils/authValidation";

const router = Router();

router.post("/register", authRateLimiter(), validateBody(registerSchema), asyncHandler(register));
router.post("/login", authRateLimiter(), validateBody(loginSchema), asyncHandler(login));
router.post("/refresh", authRateLimiter(), validateBody(refreshTokenSchema), asyncHandler(refreshSession));
router.post("/logout", authenticate, asyncHandler(logoutUser));
router.get("/me", authenticate, asyncHandler(getMe));
router.put("/profile", authenticate, validateBody(updateProfileSchema), asyncHandler(updateProfile));
router.put("/change-password", authenticate, validateBody(changePasswordSchema), asyncHandler(changePassword));

export default router;
