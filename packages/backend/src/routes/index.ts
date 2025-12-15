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

import clientsRouter from "../modules/admin/routes/client.routes";
import settingRouter from "../modules/admin/routes/setting.routes";
import adminAuthRouter from "../modules/admin/routes/auth.routes";
import coolifyRouter from "../modules/admin/routes/coolify.routes";
import taskRouter from "../modules/admin/routes/task.routes";
import userRouter from "../modules/admin/routes/user.routes";
import projectRouter from "../modules/admin/routes/project.routes";

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

// Portal Routes (Only accessible if IS a portal)
router.use("/portal", (req, res, next) => {
  if (!req.isPortal) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
});

router.use("/portal/auth", portalAuthRouter);

export default router;
