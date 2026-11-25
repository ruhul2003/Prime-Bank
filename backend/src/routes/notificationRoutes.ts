import { Router } from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

router.use(authenticate);

router.get("/my", asyncHandler(getMyNotifications));
router.patch("/:id/read", asyncHandler(markAsRead));
router.patch("/read-all", asyncHandler(markAllAsRead));

export default router;
