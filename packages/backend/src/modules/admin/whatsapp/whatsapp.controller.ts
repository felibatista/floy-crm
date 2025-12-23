import { Request, Response } from "express";
import { WhatsAppService } from "./whatsapp.service";

export class WhatsAppController {
  private service: WhatsAppService;

  constructor() {
    this.service = new WhatsAppService();
  }

  // Connection & Auth
  login = async (req: Request, res: Response) => {
    try {
      const result = await this.service.login();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  loginWithCode = async (req: Request, res: Response) => {
    try {
      const phone = req.query.phone as string;
      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      const result = await this.service.loginWithCode(phone);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const result = await this.service.logout();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  reconnect = async (req: Request, res: Response) => {
    try {
      const result = await this.service.reconnect();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getDevices = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getDevices();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getStatus = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getStatus();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // User info
  getUserInfo = async (req: Request, res: Response) => {
    try {
      const phone = req.query.phone as string;
      const result = await this.service.getUserInfo(phone);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getUserAvatar = async (req: Request, res: Response) => {
    try {
      const phone = req.query.phone as string;
      const isPreview = req.query.is_preview === "true";
      const result = await this.service.getUserAvatar(phone, isPreview);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getContacts = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getContacts();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getGroups = async (req: Request, res: Response) => {
    try {
      const result = await this.service.getGroups();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Chats
  getChats = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 25;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const result = await this.service.getChats(limit, offset, search);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getChatMessages = async (req: Request, res: Response) => {
    try {
      const chatJid = req.params.chatJid;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await this.service.getChatMessages(chatJid, limit, offset);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Send messages
  sendMessage = async (req: Request, res: Response) => {
    try {
      const { phone, message, reply_message_id } = req.body;
      if (!phone || !message) {
        return res
          .status(400)
          .json({ error: "Phone and message are required" });
      }
      const result = await this.service.sendMessage(
        phone,
        message,
        reply_message_id
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  sendImage = async (req: Request, res: Response) => {
    try {
      const { phone, image_url, caption } = req.body;
      if (!phone || !image_url) {
        return res
          .status(400)
          .json({ error: "Phone and image_url are required" });
      }
      const result = await this.service.sendImage(phone, image_url, caption);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  sendFile = async (req: Request, res: Response) => {
    try {
      const { phone, file_url, caption } = req.body;
      if (!phone || !file_url) {
        return res
          .status(400)
          .json({ error: "Phone and file_url are required" });
      }
      const result = await this.service.sendFile(phone, file_url, caption);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Message actions
  readMessage = async (req: Request, res: Response) => {
    try {
      const messageId = req.params.messageId;
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ error: "Phone is required" });
      }
      const result = await this.service.readMessage(messageId, phone);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  reactMessage = async (req: Request, res: Response) => {
    try {
      const messageId = req.params.messageId;
      const { phone, emoji } = req.body;
      if (!phone || !emoji) {
        return res.status(400).json({ error: "Phone and emoji are required" });
      }
      const result = await this.service.reactMessage(messageId, phone, emoji);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
