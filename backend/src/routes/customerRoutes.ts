import { Router } from "express";
import {
  getAllCustomers,
  getCustomerDetails,
  updateCustomerStatus,
  registerCustomerByStaff,
} from "../controllers/customerController";
import { authenticate } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/role";
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("admin", "staff"));

router.get("/all", asyncHandler(getAllCustomers));
router.get("/:id", asyncHandler(getCustomerDetails));
router.patch("/:id/status", asyncHandler(updateCustomerStatus));
router.post("/onboard", asyncHandler(registerCustomerByStaff));

export default router;
