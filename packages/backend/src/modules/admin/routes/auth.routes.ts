import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.get("/status", authController.checkStatus.bind(authController));
router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));

export default router;
