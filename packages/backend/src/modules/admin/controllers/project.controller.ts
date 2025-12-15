import { Request, Response } from "express";
import { projectService } from "../services/project.service";

export class ProjectController {
  async list(req: Request, res: Response) {
    try {
      const projects = await projectService.list();
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
}

export const projectController = new ProjectController();
