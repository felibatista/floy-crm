import { Request, Response } from "express";
import { ClientService } from "../services/client.service";

const clientService = new ClientService();

export class ClientController {
  async getClients(req: Request, res: Response) {
    try {
      const clients = await clientService.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  }

  async createClient(req: Request, res: Response) {
    const { name, email, slug, isPortalEnabled } = req.body;

    try {
      // Check if slug exists
      const existingSlug = await clientService.getClientBySlug(slug);
      if (existingSlug) {
        return res.status(400).json({ error: "Subdomain already taken" });
      }

      const client = await clientService.createClient({
        name,
        email,
        slug,
        isPortalEnabled,
      });

      res.status(201).json(client);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create client" });
    }
  }

  async updateClient(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, slug, isPortalEnabled, domain } = req.body;

    // Implementation pending in original file
    // try {
    //   const client = await clientService.updateClient(id, {
    //     name,
    //     email,
    //     slug,
    //     isPortalEnabled,
    //     domain,
    //   });
    //   res.json(client);
    // } catch (error) {
    //   res.status(500).json({ error: "Failed to update client" });
    // }
  }
}
