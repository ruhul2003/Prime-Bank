import { Router } from "express";
import {
  submitRequest,
  getMyRequests,
  getAllRequests,
  reviewRequest,
} from "../controllers/depositWithdrawController";
import { authenticate } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/role";
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

router.use(authenticate);

router.post("/request", asyncHandler(submitRequest));
router.get("/my-requests", asyncHandler(getMyRequests));
router.get("/all", authorizeRoles("admin", "staff"), asyncHandler(getAllRequests));
router.patch("/:id/review", authorizeRoles("admin", "staff"), asyncHandler(reviewRequest));

export default router;
