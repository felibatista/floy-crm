import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();
const authController = new AuthController();

// Public routes
router.get("/status", authController.checkStatus.bind(authController));
router.post("/login", authController.login.bind(authController));

// Protected routes
router.get(
  "/verify",
  verifyAdminToken,
  authController.verify.bind(authController)
);
router.get(
  "/profile",
  verifyAdminToken,
  authController.getProfile.bind(authController)
);
router.put(
  "/profile",
  verifyAdminToken,
  authController.updateProfile.bind(authController)
);
router.post(
  "/change-password",
  verifyAdminToken,
  authController.changePassword.bind(authController)
);

export default router;
