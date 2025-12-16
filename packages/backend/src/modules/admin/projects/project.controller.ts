import { Request, Response } from "express";
import { projectService } from "./project.service";

export class ProjectController {
  async list(req: Request, res: Response) {
    try {
      const { clientId } = req.query;
      const projects = await projectService.list(
        clientId ? parseInt(clientId as string) : undefined
      );
      res.json(projects);
    } catch (error: any) {
      console.error("[ProjectController] list error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await projectService.getById(parseInt(id));

      if (!project) {
        return res.status(404).json({ error: "Proyecto no encontrado" });
      }

      res.json(project);
    } catch (error: any) {
      console.error("[ProjectController] getById error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getByClientSlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const projects = await projectService.getByClientSlug(slug);
      res.json(projects);
    } catch (error: any) {
      console.error("[ProjectController] getByClientSlug error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { githubRepo } = req.body;

      const project = await projectService.update(parseInt(id), { githubRepo });
      res.json(project);
    } catch (error: any) {
      console.error("[ProjectController] update error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, description, clientId, githubRepo } = req.body;

      if (!name || !clientId) {
        return res.status(400).json({ error: "Nombre y clientId son requeridos" });
      }

      const project = await projectService.create({
        name,
        description,
        clientId: parseInt(clientId),
        githubRepo,
      });

      res.status(201).json(project);
    } catch (error: any) {
      console.error("[ProjectController] create error:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const projectController = new ProjectController();
