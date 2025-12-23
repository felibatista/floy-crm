import { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { AIService } from "./ai.service";

export class AutoResponseController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  // Context endpoints
  getContext = async (req: Request, res: Response) => {
    try {
      const contexts = await prisma.whatsAppContext.findMany({
        orderBy: { updatedAt: "desc" },
        take: 1,
      });
      res.json(contexts[0] || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateContext = async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      // Get existing context or create new one
      const existing = await prisma.whatsAppContext.findFirst();

      const context = existing
        ? await prisma.whatsAppContext.update({
            where: { id: existing.id },
            data: { content },
          })
        : await prisma.whatsAppContext.create({
            data: { content },
          });

      res.json(context);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Response Types endpoints
  getResponseTypes = async (req: Request, res: Response) => {
    try {
      const types = await prisma.whatsAppResponseType.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(types);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  createResponseType = async (req: Request, res: Response) => {
    try {
      const { name, example } = req.body;
      if (!name || !example) {
        return res.status(400).json({ error: "Name and example are required" });
      }

      const type = await prisma.whatsAppResponseType.create({
        data: { name, example },
      });

      res.json(type);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateResponseType = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, example } = req.body;

      const type = await prisma.whatsAppResponseType.update({
        where: { id },
        data: { name, example },
      });

      res.json(type);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  deleteResponseType = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await prisma.whatsAppResponseType.delete({ where: { id } });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Contacts endpoints
  getContacts = async (req: Request, res: Response) => {
    try {
      const contacts = await prisma.whatsAppContact.findMany({
        orderBy: { name: "asc" },
      });
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  getContact = async (req: Request, res: Response) => {
    try {
      const { jid } = req.params;
      const contact = await prisma.whatsAppContact.findUnique({
        where: { jid },
      });
      res.json(contact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  createContact = async (req: Request, res: Response) => {
    try {
      const { jid, name, company, notes } = req.body;
      if (!jid || !name) {
        return res.status(400).json({ error: "JID and name are required" });
      }

      const contact = await prisma.whatsAppContact.create({
        data: { jid, name, company, notes },
      });

      res.json(contact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  updateContact = async (req: Request, res: Response) => {
    try {
      const { jid } = req.params;
      const { name, company, notes } = req.body;

      const contact = await prisma.whatsAppContact.update({
        where: { jid },
        data: { name, company, notes },
      });

      res.json(contact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  deleteContact = async (req: Request, res: Response) => {
    try {
      const { jid } = req.params;
      await prisma.whatsAppContact.delete({ where: { jid } });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  // Generate AI response
  generateResponse = async (req: Request, res: Response) => {
    try {
      const { jid, conversationHistory } = req.body;

      if (!conversationHistory || !Array.isArray(conversationHistory)) {
        return res
          .status(400)
          .json({ error: "Conversation history is required" });
      }

      // Get context
      const context = await prisma.whatsAppContext.findFirst();
      if (!context) {
        return res
          .status(400)
          .json({ error: "No context configured. Please set up context first." });
      }

      // Get response types
      const responseTypes = await prisma.whatsAppResponseType.findMany();

      // Get contact info if available
      let contactInfo = undefined;
      if (jid) {
        const contact = await prisma.whatsAppContact.findUnique({
          where: { jid },
        });
        if (contact) {
          contactInfo = {
            name: contact.name,
            company: contact.company || undefined,
          };
        }
      }

      // Generate response
      const response = await this.aiService.generateResponse(
        context.content,
        responseTypes.map((t) => ({ name: t.name, example: t.example })),
        conversationHistory,
        contactInfo
      );

      res.json({ response });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
