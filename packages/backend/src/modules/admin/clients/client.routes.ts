import { Router } from "express";
import { ClientController } from "./client.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();
const clientController = new ClientController();

router.get("/", verifyAdminToken, clientController.list.bind(clientController));
router.get(
  "/slug/:slug",
  verifyAdminToken,
  clientController.getBySlug.bind(clientController)
);
router.get(
  "/:id",
  verifyAdminToken,
  clientController.getById.bind(clientController)
);
router.post(
  "/",
  verifyAdminToken,
  clientController.create.bind(clientController)
);
router.put(
  "/:id",
  verifyAdminToken,
  clientController.update.bind(clientController)
);
router.delete(
  "/:id",
  verifyAdminToken,
  clientController.delete.bind(clientController)
);

export default router;
