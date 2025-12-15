import { Router } from "express";
import { settingController } from "./setting.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();

router.get(
  "/",
  verifyAdminToken,
  settingController.getAll.bind(settingController)
);
router.post(
  "/",
  verifyAdminToken,
  settingController.set.bind(settingController)
);
router.post(
  "/bulk",
  verifyAdminToken,
  settingController.getByKeys.bind(settingController)
);
router.get(
  "/:key",
  verifyAdminToken,
  settingController.get.bind(settingController)
);
router.delete(
  "/:key",
  verifyAdminToken,
  settingController.delete.bind(settingController)
);

export default router;
