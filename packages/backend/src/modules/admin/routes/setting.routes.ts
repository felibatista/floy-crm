import { Router } from "express";
import { SettingController } from "../controllers/setting.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();
const settingController = new SettingController();

router.get(
  "/",
  verifyAdminToken,
  settingController.getSettings.bind(settingController)
);
router.post(
  "/",
  verifyAdminToken,
  settingController.createSetting.bind(settingController)
);
router.put(
  "/:key",
  verifyAdminToken,
  settingController.updateSetting.bind(settingController)
);
router.delete(
  "/:key",
  verifyAdminToken,
  settingController.deleteSetting.bind(settingController)
);

export default router;
