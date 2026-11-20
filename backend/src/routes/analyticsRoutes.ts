import { Router } from "express";
import { getAdminAnalytics, getCustomerAnalytics } from "../controllers/analyticsController";
import { authenticate } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/role";

const router = Router();

router.use(authenticate);

router.get("/admin", authorizeRoles("admin", "staff"), getAdminAnalytics);
router.get("/customer", getCustomerAnalytics);

export default router;
