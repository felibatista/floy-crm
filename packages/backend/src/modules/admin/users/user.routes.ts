import { Router } from "express";
import { userController } from "./user.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();

router.get("/", verifyAdminToken, userController.list.bind(userController));
router.get(
  "/:id",
  verifyAdminToken,
  userController.getById.bind(userController)
);

export default router;
