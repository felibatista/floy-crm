import { Router } from "express";
import { workLogController } from "./worklog.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();

// Listar worklogs (requiere ?taskId=X)
router.get("/", verifyAdminToken, workLogController.list.bind(workLogController));

// Obtener tiempo total de una tarea
router.get(
  "/task/:taskId/total",
  verifyAdminToken,
  workLogController.getTotalTime.bind(workLogController)
);

// Obtener estadísticas de una tarea
router.get(
  "/task/:taskId/stats",
  verifyAdminToken,
  workLogController.getStats.bind(workLogController)
);

// Obtener un worklog por ID
router.get(
  "/:id",
  verifyAdminToken,
  workLogController.getById.bind(workLogController)
);

// Crear worklog
router.post("/", verifyAdminToken, workLogController.create.bind(workLogController));

// Actualizar worklog
router.put(
  "/:id",
  verifyAdminToken,
  workLogController.update.bind(workLogController)
);

// Eliminar worklog
router.delete(
  "/:id",
  verifyAdminToken,
  workLogController.delete.bind(workLogController)
);

export default router;
