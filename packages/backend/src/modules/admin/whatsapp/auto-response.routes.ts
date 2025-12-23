import { Router } from "express";
import { AutoResponseController } from "./auto-response.controller";

const router = Router();
const controller = new AutoResponseController();

// Context
router.get("/context", controller.getContext);
router.put("/context", controller.updateContext);

// Response Types
router.get("/response-types", controller.getResponseTypes);
router.post("/response-types", controller.createResponseType);
router.put("/response-types/:id", controller.updateResponseType);
router.delete("/response-types/:id", controller.deleteResponseType);

// Contacts
router.get("/contacts", controller.getContacts);
router.get("/contacts/:jid", controller.getContact);
router.post("/contacts", controller.createContact);
router.put("/contacts/:jid", controller.updateContact);
router.delete("/contacts/:jid", controller.deleteContact);

// AI Generate
router.post("/generate-response", controller.generateResponse);

export const autoResponseRoutes = router;
export default router;
