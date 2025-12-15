import { Router } from "express";
import { ClientController } from "../controllers/client.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();
const clientController = new ClientController();

// List clients with pagination
router.get("/", verifyAdminToken, clientController.list.bind(clientController));

// Get client by slug (must come before /:id to avoid conflicts)
router.get(
  "/slug/:slug",
  verifyAdminToken,
  clientController.getBySlug.bind(clientController)
);

// Get client by ID
router.get(
  "/:id",
  verifyAdminToken,
  clientController.getById.bind(clientController)
);

// Create a new client
router.post(
  "/",
  verifyAdminToken,
  clientController.create.bind(clientController)
);

// Update client
router.put(
  "/:id",
  verifyAdminToken,
  clientController.update.bind(clientController)
);

// Delete client
router.delete(
  "/:id",
  verifyAdminToken,
  clientController.delete.bind(clientController)
);

export default router;
