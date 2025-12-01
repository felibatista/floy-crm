import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/login", authController.login.bind(authController));
router.post(
  "/setup-password",
  authController.setupPassword.bind(authController)
);

export default router;
