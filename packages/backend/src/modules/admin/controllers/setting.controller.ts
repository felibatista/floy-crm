import { Request, Response } from "express";
import { SettingService } from "../services/setting.service";

const settingService = new SettingService();

export class SettingController {
  async getSettings(req: Request, res: Response) {
    try {
      const settings = await settingService.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  }

  async createSetting(req: Request, res: Response) {
    const { key, value, description } = req.body;
    try {
      const setting = await settingService.createSetting({
        key,
        value,
        description,
      });
      res.status(201).json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to create setting" });
    }
  }

  async updateSetting(req: Request, res: Response) {
    const { key } = req.params;
    const { value } = req.body;
    try {
      const setting = await settingService.updateSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to update setting" });
    }
  }

  async deleteSetting(req: Request, res: Response) {
    const { key } = req.params;
    try {
      await settingService.deleteSetting(key);
      res.json({ message: "Setting deleted successfully" });
    } catch (error: any) {
      if (error.message === "Cannot delete a system setting") {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to delete setting" });
    }
  }
}
