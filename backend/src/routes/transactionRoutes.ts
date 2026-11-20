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

const router = Router();

router.use(authenticate);

router.post("/transfer", transferFund);
router.get("/my-transactions", getMyTransactions);
router.get("/all", authorizeRoles("admin", "staff"), getAllTransactions);
router.get("/:id", getTransactionById);
router.patch("/:id/flag", authorizeRoles("admin", "staff"), flagSuspiciousTransaction);

export default router;
