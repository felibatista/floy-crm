import { Router } from "express";
import { Request, Response } from "express";
import portalAuthRouter from "../modules/portal/routes/auth.routes";

const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    isPortal: req.isPortal,
    client: req.clientPortal?.name,
  });
});

// Admin module routes
import { authRoutes as adminAuthRouter } from "../modules/admin/auth";
import { clientRoutes as clientsRouter } from "../modules/admin/clients";
import { leadRoutes as leadRouter } from "../modules/admin/leads";
import { taskRoutes as taskRouter } from "../modules/admin/tasks";
import { userRoutes as userRouter } from "../modules/admin/users";
import { projectRoutes as projectRouter } from "../modules/admin/projects";
import { settingRoutes as settingRouter } from "../modules/admin/settings";
import { coolifyRoutes as coolifyRouter } from "../modules/admin/coolify";

// Admin Routes (Only accessible if NOT a portal)
router.use("/admin", (req, res, next) => {
  if (req.isPortal) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
});

router.use("/admin/auth", adminAuthRouter);
router.use("/admin/clients", clientsRouter);
router.use("/admin/settings", settingRouter);
router.use("/admin/coolify", coolifyRouter);
router.use("/admin/tasks", taskRouter);
router.use("/admin/users", userRouter);
router.use("/admin/projects", projectRouter);
router.use("/admin/leads", leadRouter);

// Portal Routes (Only accessible if IS a portal)
router.use("/portal", (req, res, next) => {
  if (!req.isPortal) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
});

router.use("/portal/auth", portalAuthRouter);

export default router;
