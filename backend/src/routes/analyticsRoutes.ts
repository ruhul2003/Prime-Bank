import { Router } from "express";
import { getAdminAnalytics, getCustomerAnalytics } from "../controllers/analyticsController";
import { authenticate } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/role";
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

router.use(authenticate);

router.get("/admin", authorizeRoles("admin", "staff"), asyncHandler(getAdminAnalytics));
router.get("/customer", asyncHandler(getCustomerAnalytics));

export default router;
