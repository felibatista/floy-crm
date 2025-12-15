import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();

router.get("/", verifyAdminToken, userController.list.bind(userController));

export default router;
