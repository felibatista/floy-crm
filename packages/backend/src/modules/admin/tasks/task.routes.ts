import { Router } from "express";
import { taskController } from "./task.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();

router.get("/", verifyAdminToken, taskController.list.bind(taskController));
router.get(
  "/categories",
  verifyAdminToken,
  taskController.getCategories.bind(taskController)
);
router.get(
  "/code/:code",
  verifyAdminToken,
  taskController.getByCode.bind(taskController)
);
router.get(
  "/:id",
  verifyAdminToken,
  taskController.getById.bind(taskController)
);
router.post("/", verifyAdminToken, taskController.create.bind(taskController));
router.put(
  "/:id",
  verifyAdminToken,
  taskController.update.bind(taskController)
);
router.delete(
  "/:id",
  verifyAdminToken,
  taskController.delete.bind(taskController)
);

export default router;
