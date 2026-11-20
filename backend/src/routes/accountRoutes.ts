import { Router } from "express";
import {
  createAccount,
  getMyAccounts,
  getAllAccounts,
  getAccountById,
  freezeUnfreezeAccount,
  setAccountLimits,
  updatePin,
} from "../controllers/accountController";
import { authenticate } from "../middlewares/auth";
import { authorizeRoles } from "../middlewares/role";

const router = Router();

router.use(authenticate);

router.post("/", createAccount);
router.get("/my-accounts", getMyAccounts);
router.get("/all", authorizeRoles("admin", "staff"), getAllAccounts);
router.get("/:id", getAccountById);
router.patch("/:id/status", authorizeRoles("admin"), freezeUnfreezeAccount);
router.patch("/:id/limits", authorizeRoles("admin"), setAccountLimits);
router.post("/update-pin", updatePin);

export default router;
