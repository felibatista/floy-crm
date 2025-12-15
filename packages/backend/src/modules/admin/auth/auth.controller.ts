import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const authService = new AuthService();

export class AuthController {
  async checkStatus(req: Request, res: Response) {
    try {
      const hasUsers = await authService.hasUsers();
      res.json({ isInitialized: hasUsers });
    } catch (error) {
      res.status(500).json({ error: "Failed to check status" });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    try {
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        return res.status(401).json({ error: error.message });
      }
      console.error(error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await authService.getProfile(userId);
      res.json(user);
    } catch (error: any) {
      if (error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }
      console.error(error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { name, email } = req.body;
      const user = await authService.updateProfile(userId, { name, email });
      res.json(user);
    } catch (error: any) {
      if (error.message === "Email already in use") {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      const result = await authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      res.json(result);
    } catch (error: any) {
      if (error.message === "Current password is incorrect") {
        return res.status(400).json({ error: error.message });
      }
      console.error(error);
      res.status(500).json({ error: "Failed to change password" });
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await authService.getProfile(userId);
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify" });
    }
  }
}
