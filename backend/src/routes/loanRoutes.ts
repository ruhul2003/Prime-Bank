import { Router } from "express";
import {
  applyLoan,
  getMyLoans,
  getAllLoans,
  getLoanById,
  reviewLoanStaff,
  approveLoanAdmin,
  rejectLoanAdmin,
  payLoanInstallment,
} from "../controllers/loanController";
import { authenticate } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/role";

const router = Router();

router.use(authenticate);

router.post("/apply", applyLoan);
router.get("/my-loans", getMyLoans);
router.get("/all", authorizeRoles("admin", "staff"), getAllLoans);
router.get("/:id", getLoanById);
router.patch("/:id/staff-review", authorizeRoles("staff", "admin"), reviewLoanStaff);
router.patch("/:id/approve", authorizeRoles("admin"), approveLoanAdmin);
router.patch("/:id/reject", authorizeRoles("admin"), rejectLoanAdmin);
router.post("/:id/pay-installment", payLoanInstallment);

export default router;
