import { Request, Response } from "express";
import { ClientService } from "../services/client.service";

const clientService = new ClientService();

export class ClientController {
  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string | undefined;

      const result = await clientService.list({ page, limit, search });
      res.json(result);
    } catch (error) {
      console.error("Error listing clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid client ID" });
      }

      const client = await clientService.getById(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const client = await clientService.getBySlug(slug);

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, email, phone, company, address, slug, isPortalEnabled } =
        req.body;

      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }

      // Check if slug exists
      const slugExists = await clientService.checkSlugExists(slug);
      if (slugExists) {
        return res.status(400).json({ error: "Slug already taken" });
      }

      const client = await clientService.create({
        name,
        email,
        phone,
        company,
        address,
        slug,
        isPortalEnabled,
      });

      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid client ID" });
      }

      const { name, email, phone, company, address, slug, isPortalEnabled } =
        req.body;

      // Check if slug is being changed and if new slug exists
      if (slug) {
        const slugExists = await clientService.checkSlugExists(slug, id);
        if (slugExists) {
          return res.status(400).json({ error: "Slug already taken" });
        }
      }

      const client = await clientService.update(id, {
        name,
        email,
        phone,
        company,
        address,
        slug,
        isPortalEnabled,
      });

      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid client ID" });
      }

      await clientService.delete(id);
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  }
}
