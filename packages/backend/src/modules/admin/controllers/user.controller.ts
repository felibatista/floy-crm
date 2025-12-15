import { Request, Response } from "express";
import { userService } from "../services/user.service";

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
}

export const userController = new UserController();
