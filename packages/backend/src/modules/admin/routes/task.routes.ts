import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();

// List tasks with pagination
router.get("/", verifyAdminToken, taskController.list.bind(taskController));

// Get categories
router.get(
  "/categories",
  verifyAdminToken,
  taskController.getCategories.bind(taskController)
);

// Get task by code
router.get(
  "/code/:code",
  verifyAdminToken,
  taskController.getByCode.bind(taskController)
);

// Get task by ID
router.get(
  "/:id",
  verifyAdminToken,
  taskController.getById.bind(taskController)
);

// Create task
router.post("/", verifyAdminToken, taskController.create.bind(taskController));

// Update task
router.put(
  "/:id",
  verifyAdminToken,
  taskController.update.bind(taskController)
);

// Delete task
router.delete(
  "/:id",
  verifyAdminToken,
  taskController.delete.bind(taskController)
);

export default router;
