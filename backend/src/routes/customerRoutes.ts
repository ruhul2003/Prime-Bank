import { Router } from "express";
import {
  getAllCustomers,
  getCustomerDetails,
  updateCustomerStatus,
  registerCustomerByStaff,
} from "../controllers/customerController";
import { authenticate } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/role";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("admin", "staff"));

router.get("/all", getAllCustomers);
router.get("/:id", getCustomerDetails);
router.patch("/:id/status", updateCustomerStatus);
router.post("/onboard", registerCustomerByStaff);

export default router;
