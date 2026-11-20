import { Router } from "express";
import {
  submitRequest,
  getMyRequests,
  getAllRequests,
  reviewRequest,
} from "../controllers/depositWithdrawController";
import { authenticate } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/role";

const router = Router();

router.use(authenticate);

router.post("/request", submitRequest);
router.get("/my-requests", getMyRequests);
router.get("/all", authorizeRoles("admin", "staff"), getAllRequests);
router.patch("/:id/review", authorizeRoles("admin", "staff"), reviewRequest);

export default router;
