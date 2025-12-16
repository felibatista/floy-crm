import { Router } from "express";
import { calendarController } from "./calendar.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();

router.get(
  "/events",
  verifyAdminToken,
  calendarController.list.bind(calendarController)
);
router.get(
  "/events/:id",
  verifyAdminToken,
  calendarController.getById.bind(calendarController)
);
router.post(
  "/events",
  verifyAdminToken,
  calendarController.create.bind(calendarController)
);
router.put(
  "/events/:id",
  verifyAdminToken,
  calendarController.update.bind(calendarController)
);
router.delete(
  "/events/:id",
  verifyAdminToken,
  calendarController.delete.bind(calendarController)
);

export default router;
