import { Request, Response } from "express";
import { settingService } from "./setting.service";

export class SettingController {
  async getAll(req: Request, res: Response) {
    try {
      const settings = await settingService.getAll();
      res.json(settings);
    } catch (error: any) {
      console.error("[SettingController] getAll error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { key } = req.params;
      const value = await settingService.get(key);

      if (value === undefined) {
        return res.status(404).json({ error: "Setting no encontrado" });
      }

      res.json({ key, value });
    } catch (error: any) {
      console.error("[SettingController] get error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async set(req: Request, res: Response) {
    try {
      const { key, value, description } = req.body;

      if (!key || value === undefined) {
        return res.status(400).json({ error: "Key y value son requeridos" });
      }

      const setting = await settingService.set(key, value, description);
      res.json(setting);
    } catch (error: any) {
      console.error("[SettingController] set error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { key } = req.params;
      await settingService.delete(key);
      res.status(204).send();
    } catch (error: any) {
      console.error("[SettingController] delete error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getByKeys(req: Request, res: Response) {
    try {
      const { keys } = req.body;

      if (!Array.isArray(keys)) {
        return res.status(400).json({ error: "Keys debe ser un array" });
      }

      const settings = await settingService.getByKeys(keys);
      res.json(settings);
    } catch (error: any) {
      console.error("[SettingController] getByKeys error:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const settingController = new SettingController();
