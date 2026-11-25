import { Router } from "express";
import {
  transferFund,
  getMyTransactions,
  getAllTransactions,
  getTransactionById,
  flagSuspiciousTransaction,
} from "../controllers/transactionController";
import { authenticate } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/role";
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

router.use(authenticate);

router.post("/transfer", asyncHandler(transferFund));
router.get("/my-transactions", asyncHandler(getMyTransactions));
router.get("/all", authorizeRoles("admin", "staff"), asyncHandler(getAllTransactions));
router.get("/:id", asyncHandler(getTransactionById));
router.patch("/:id/flag", authorizeRoles("admin", "staff"), asyncHandler(flagSuspiciousTransaction));

export default router;
