import { Router } from "express";
import { projectController } from "./project.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();

router.get(
  "/",
  verifyAdminToken,
  projectController.list.bind(projectController)
);
router.post(
  "/",
  verifyAdminToken,
  projectController.create.bind(projectController)
);
router.get(
  "/client/:slug",
  verifyAdminToken,
  projectController.getByClientSlug.bind(projectController)
);
router.get(
  "/:id",
  verifyAdminToken,
  projectController.getById.bind(projectController)
);
router.put(
  "/:id",
  verifyAdminToken,
  projectController.update.bind(projectController)
);

export default router;
