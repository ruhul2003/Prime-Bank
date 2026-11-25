import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authenticate, asyncHandler(getMe));
router.put("/profile", authenticate, asyncHandler(updateProfile));
router.put("/change-password", authenticate, asyncHandler(changePassword));

export default router;
