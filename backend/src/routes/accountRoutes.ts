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
import { asyncHandler } from "../middlewares/errorHandler";

const router = Router();

router.use(authenticate);

router.post("/", asyncHandler(createAccount));
router.get("/my-accounts", asyncHandler(getMyAccounts));
router.get("/all", authorizeRoles("admin", "staff"), asyncHandler(getAllAccounts));
router.get("/:id", asyncHandler(getAccountById));
router.patch("/:id/status", authorizeRoles("admin"), asyncHandler(freezeUnfreezeAccount));
router.patch("/:id/limits", authorizeRoles("admin"), asyncHandler(setAccountLimits));
router.post("/update-pin", asyncHandler(updatePin));

export default router;
