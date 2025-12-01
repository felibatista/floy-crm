import { Router } from "express";
import { ClientController } from "../controllers/client.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();
const clientController = new ClientController();

// Get all clients
router.get(
  "/",
  verifyAdminToken,
  clientController.getClients.bind(clientController)
);

// Create a new client (and portal)
router.post("/", clientController.createClient.bind(clientController));

// Update client
router.put("/:id", clientController.updateClient.bind(clientController));

export default router;
