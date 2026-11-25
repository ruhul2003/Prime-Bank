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
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

router.use(authenticate);

router.post("/apply", asyncHandler(applyLoan));
router.get("/my-loans", asyncHandler(getMyLoans));
router.get("/all", authorizeRoles("admin", "staff"), asyncHandler(getAllLoans));
router.get("/:id", asyncHandler(getLoanById));
router.patch("/:id/staff-review", authorizeRoles("staff", "admin"), asyncHandler(reviewLoanStaff));
router.patch("/:id/approve", authorizeRoles("admin"), asyncHandler(approveLoanAdmin));
router.patch("/:id/reject", authorizeRoles("admin"), asyncHandler(rejectLoanAdmin));
router.post("/:id/pay-installment", asyncHandler(payLoanInstallment));

export default router;
