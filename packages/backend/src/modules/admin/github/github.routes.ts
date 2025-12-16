import { Router } from "express";
import { githubController } from "./github.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();

// Estadísticas
router.get(
  "/stats",
  verifyAdminToken,
  githubController.getStats.bind(githubController)
);

// Logs de sincronización
router.get(
  "/sync-logs",
  verifyAdminToken,
  githubController.getSyncLogs.bind(githubController)
);

// Proyectos con repos configurados
router.get(
  "/projects",
  verifyAdminToken,
  githubController.getProjectsWithRepos.bind(githubController)
);

// Commits de una tarea
router.get(
  "/commits/task/:taskId",
  verifyAdminToken,
  githubController.getCommitsByTask.bind(githubController)
);

// Validar repositorio
router.post(
  "/validate",
  verifyAdminToken,
  githubController.validateRepo.bind(githubController)
);

// Sincronizar todos los repos
router.post(
  "/sync",
  verifyAdminToken,
  githubController.syncAll.bind(githubController)
);

// Sincronizar un repo específico (formato: /sync/owner/repo)
router.post(
  "/sync/:owner/:repo",
  verifyAdminToken,
  githubController.syncRepository.bind(githubController)
);

export default router;
