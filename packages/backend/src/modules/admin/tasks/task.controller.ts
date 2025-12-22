import { Request, Response } from "express";
import { taskService } from "./task.service";

export class TaskController {
  async list(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "50",
        status,
        assignedToId,
        projectId,
        category,
        search,
      } = req.query;

      // Handle status as either a single value or an array
      let statusParam: any = undefined;
      if (status) {
        if (Array.isArray(status)) {
          statusParam = status;
        } else {
          statusParam = status;
        }
      }

      const result = await taskService.list({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: statusParam,
        assignedToId: assignedToId
          ? parseInt(assignedToId as string)
          : undefined,
        projectId: projectId ? parseInt(projectId as string) : undefined,
        category: category as string,
        search: search as string,
      });

      res.json(result);
    } catch (error: any) {
      console.error("[TaskController] list error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await taskService.getById(parseInt(id));

      if (!task) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }

      res.json(task);
    } catch (error: any) {
      console.error("[TaskController] getById error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const task = await taskService.getByCode(code);

      if (!task) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }

      res.json(task);
    } catch (error: any) {
      console.error("[TaskController] getByCode error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const task = await taskService.create(req.body);
      res.status(201).json(task);
    } catch (error: any) {
      console.error("[TaskController] create error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await taskService.update(parseInt(id), req.body);
      res.json(task);
    } catch (error: any) {
      console.error("[TaskController] update error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await taskService.delete(parseInt(id));
      res.status(204).send();
    } catch (error: any) {
      console.error("[TaskController] delete error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await taskService.getCategories();
      res.json(categories);
    } catch (error: any) {
      console.error("[TaskController] getCategories error:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const taskController = new TaskController();
