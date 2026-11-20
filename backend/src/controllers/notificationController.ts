import { Response } from "express";
import { Notification } from "../models/Notification";
import { AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/errorHandler";

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);

  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    unreadCount,
    notifications,
  });
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!req.user) throw new AppError("Unauthorized", 401);

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  res.status(200).json({
    success: true,
    notification,
  });
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) throw new AppError("Unauthorized", 401);

  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });

  res.status(200).json({
    success: true,
    message: "All notifications marked as read.",
  });
};
