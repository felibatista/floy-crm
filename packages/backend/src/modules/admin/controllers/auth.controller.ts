import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

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

  async register(req: Request, res: Response) {
    const { name, email, password, masterPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const result = await authService.register(
        { name, email, password },
        masterPassword
      );
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === "Invalid master password") {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === "User already exists") {
        return res.status(409).json({ error: error.message });
      }
      console.error(error);
      res.status(500).json({ error: "Registration failed" });
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

  async verify(req: Request, res: Response) {
    res.json({ user: req.auth });
  }
}
