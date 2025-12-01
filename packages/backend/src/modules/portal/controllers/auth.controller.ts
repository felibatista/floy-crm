import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const { password } = req.body;
    const client = req.clientPortal;

    if (!client) return res.status(404).json({ error: "Portal not found" });

    if (!client.passwordHash) {
      return res
        .status(403)
        .json({ error: "Account not activated. Please set up your password." });
    }

    const isValidPassword = await authService.validatePassword(
      password,
      client.passwordHash
    );
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = authService.generateToken(client);

    res.json({
      token,
      client: { id: client.id, name: client.name, slug: client.slug },
    });
  }

  async setupPassword(req: Request, res: Response) {
    const { newPassword } = req.body;
    const client = req.clientPortal;

    if (client.passwordHash) {
      return res
        .status(400)
        .json({ error: "Password already set. Please login." });
    }

    const hashedPassword = await authService.hashPassword(newPassword);

    await authService.updateClientPassword(client.id, hashedPassword);

    const token = authService.generateToken(client);

    res.json({
      message: "Password set successfully. You can now login.",
      token,
      client: { id: client.id, name: client.name, slug: client.slug },
    });
  }
}
