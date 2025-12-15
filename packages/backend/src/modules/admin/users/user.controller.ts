import { Request, Response } from "express";
import { userService } from "./user.service";

export class UserController {
  async list(req: Request, res: Response) {
    try {
      const users = await userService.list();
      res.json(users);
    } catch (error: any) {
      console.error("[UserController] list error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.getById(parseInt(id));

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("[UserController] getById error:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const userController = new UserController();
