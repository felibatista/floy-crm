import { Request, Response } from "express";
import { workLogService } from "./worklog.service";

export class WorkLogController {
  async list(req: Request, res: Response) {
    try {
      const { taskId, page = "1", limit = "50" } = req.query;

      if (!taskId) {
        return res.status(400).json({ error: "taskId es requerido" });
      }

      const result = await workLogService.list({
        taskId: parseInt(taskId as string),
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json(result);
    } catch (error: any) {
      console.error("[WorkLogController] list error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workLog = await workLogService.getById(parseInt(id));

      if (!workLog) {
        return res.status(404).json({ error: "Registro de trabajo no encontrado" });
      }

      res.json(workLog);
    } catch (error: any) {
      console.error("[WorkLogController] getById error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { taskId, summary, hours, minutes, type, dateWorked } = req.body;

      if (!taskId || !summary || hours === undefined) {
        return res.status(400).json({
          error: "taskId, summary y hours son requeridos"
        });
      }

      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const workLog = await workLogService.create({
        taskId: parseInt(taskId),
        userId,
        summary,
        hours: parseInt(hours),
        minutes: minutes ? parseInt(minutes) : 0,
        type,
        dateWorked: dateWorked ? new Date(dateWorked) : undefined,
      });

      res.status(201).json(workLog);
    } catch (error: any) {
      console.error("[WorkLogController] create error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { summary, hours, minutes, type, dateWorked } = req.body;

      const updateData: any = {};
      if (summary !== undefined) updateData.summary = summary;
      if (hours !== undefined) updateData.hours = parseInt(hours);
      if (minutes !== undefined) updateData.minutes = parseInt(minutes);
      if (type !== undefined) updateData.type = type;
      if (dateWorked !== undefined) updateData.dateWorked = new Date(dateWorked);

      const workLog = await workLogService.update(parseInt(id), updateData);
      res.json(workLog);
    } catch (error: any) {
      console.error("[WorkLogController] update error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await workLogService.delete(parseInt(id));
      res.status(204).send();
    } catch (error: any) {
      console.error("[WorkLogController] delete error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getTotalTime(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const totalTime = await workLogService.getTotalTimeByTask(parseInt(taskId));
      res.json(totalTime);
    } catch (error: any) {
      console.error("[WorkLogController] getTotalTime error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const stats = await workLogService.getStatsByTask(parseInt(taskId));
      res.json(stats);
    } catch (error: any) {
      console.error("[WorkLogController] getStats error:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const workLogController = new WorkLogController();
