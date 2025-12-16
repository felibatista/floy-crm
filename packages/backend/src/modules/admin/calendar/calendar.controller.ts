import { Request, Response } from "express";
import { calendarService } from "./calendar.service";

export class CalendarController {
  async list(req: Request, res: Response) {
    try {
      const { userId, startDate, endDate, onlyMine } = req.query;
      const currentUserId = req.auth?.userId;

      const events = await calendarService.list({
        userId: userId ? parseInt(userId as string) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
        onlyMine: onlyMine === "true",
        currentUserId,
      });

      res.json(events);
    } catch (error: any) {
      console.error("[CalendarController] list error:", error);
      res.status(500).json({ error: "Error al obtener eventos" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await calendarService.getById(parseInt(id));

      if (!event) {
        return res.status(404).json({ error: "Evento no encontrado" });
      }

      res.json(event);
    } catch (error: any) {
      console.error("[CalendarController] getById error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const currentUserId = req.auth?.userId;
      if (!currentUserId) {
        return res.status(401).json({ error: "No autorizado" });
      }

      const { title, description, date, isAllDay, startTime, endTime } =
        req.body;

      if (!title || !date) {
        return res.status(400).json({ error: "Título y fecha son requeridos" });
      }

      const event = await calendarService.create({
        userId: currentUserId,
        title,
        description,
        date,
        isAllDay,
        startTime,
        endTime,
      });

      res.status(201).json(event);
    } catch (error: any) {
      console.error("[CalendarController] create error:", error);
      res.status(500).json({ error: "Error al crear evento" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUserId = req.auth?.userId;
      const { title, description, date, isAllDay, startTime, endTime } =
        req.body;

      // Check if event exists and belongs to current user
      const existingEvent = await calendarService.getById(parseInt(id));

      if (!existingEvent) {
        return res.status(404).json({ error: "Evento no encontrado" });
      }

      if (existingEvent.userId !== currentUserId) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para editar este evento" });
      }

      const event = await calendarService.update(parseInt(id), {
        title,
        description,
        date,
        isAllDay,
        startTime,
        endTime,
      });

      res.json(event);
    } catch (error: any) {
      console.error("[CalendarController] update error:", error);
      res.status(500).json({ error: "Error al actualizar evento" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUserId = req.auth?.userId;

      // Check if event exists and belongs to current user
      const existingEvent = await calendarService.getById(parseInt(id));

      if (!existingEvent) {
        return res.status(404).json({ error: "Evento no encontrado" });
      }

      if (existingEvent.userId !== currentUserId) {
        return res
          .status(403)
          .json({ error: "No tienes permiso para eliminar este evento" });
      }

      await calendarService.delete(parseInt(id));

      res.json({ success: true });
    } catch (error: any) {
      console.error("[CalendarController] delete error:", error);
      res.status(500).json({ error: "Error al eliminar evento" });
    }
  }
}

export const calendarController = new CalendarController();
