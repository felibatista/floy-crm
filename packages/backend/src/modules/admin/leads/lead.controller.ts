import { Request, Response } from "express";
import { LeadService } from "./lead.service";

const leadService = new LeadService();

export class LeadController {
  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string | undefined;
      const status = req.query.status as any;

      const result = await leadService.list({ page, limit, search, status });
      res.json(result);
    } catch (error: any) {
      console.error("Error listing leads:", error);
      res.status(500).json({ error: "Error al listar leads" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const lead = await leadService.getById(id);

      if (!lead) {
        return res.status(404).json({ error: "Lead no encontrado" });
      }

      res.json(lead);
    } catch (error: any) {
      console.error("Error getting lead:", error);
      res.status(500).json({ error: "Error al obtener lead" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, email, phone, company, status, notes } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Nombre es requerido" });
      }

      const lead = await leadService.create({
        name,
        email,
        phone,
        company,
        status,
        notes,
      });

      res.status(201).json(lead);
    } catch (error: any) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Error al crear lead" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const { name, email, phone, company, status, notes } = req.body;

      const lead = await leadService.update(id, {
        name,
        email,
        phone,
        company,
        status,
        notes,
      });

      res.json(lead);
    } catch (error: any) {
      console.error("Error updating lead:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Lead no encontrado" });
      }
      res.status(500).json({ error: "Error al actualizar lead" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      await leadService.delete(id);
      res.json({ message: "Lead eliminado" });
    } catch (error: any) {
      console.error("Error deleting lead:", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Lead no encontrado" });
      }
      res.status(500).json({ error: "Error al eliminar lead" });
    }
  }

  async convertToClient(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const { slug, address, isPortalEnabled } = req.body;

      if (!slug) {
        return res.status(400).json({ error: "Slug es requerido" });
      }

      const client = await leadService.convertToClient(id, {
        slug,
        address,
        isPortalEnabled,
      });

      res.json(client);
    } catch (error: any) {
      console.error("Error converting lead:", error);
      if (error.message === "Lead not found") {
        return res.status(404).json({ error: "Lead no encontrado" });
      }
      if (error.message === "Slug already exists") {
        return res.status(400).json({ error: "El slug ya existe" });
      }
      if (error.message === "Email already exists as client") {
        return res
          .status(400)
          .json({ error: "El email ya existe como cliente" });
      }
      res.status(500).json({ error: "Error al convertir lead" });
    }
  }
}
