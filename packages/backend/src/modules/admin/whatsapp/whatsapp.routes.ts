import { Router } from "express";
import { WhatsAppController } from "./whatsapp.controller";
import { verifyToken } from "../../../middleware/auth";

const router = Router();
const controller = new WhatsAppController();

// Auth required for all routes
router.use(verifyToken);

// Connection & Auth
router.get("/login", controller.login);
router.get("/login-with-code", controller.loginWithCode);
router.get("/logout", controller.logout);
router.get("/reconnect", controller.reconnect);
router.get("/devices", controller.getDevices);
router.get("/status", controller.getStatus);

// User info
router.get("/user/info", controller.getUserInfo);
router.get("/user/avatar", controller.getUserAvatar);
router.get("/user/my/contacts", controller.getContacts);
router.get("/user/my/groups", controller.getGroups);

// Chats
router.get("/chats", controller.getChats);
router.get("/chat/:chatJid/messages", controller.getChatMessages);

// Send messages
router.post("/send/message", controller.sendMessage);
router.post("/send/image", controller.sendImage);
router.post("/send/file", controller.sendFile);

// Message actions
router.post("/message/:messageId/read", controller.readMessage);
router.post("/message/:messageId/reaction", controller.reactMessage);

export const whatsappRoutes = router;
