import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  async hasUsers() {
    const count = await prisma.user.count();
    return count > 0;
  }

  async register(
    data: { name: string; email: string; password: string },
    masterPassword?: string
  ) {
    const hasUsers = await this.hasUsers();

    if (hasUsers) {
      const envMasterPassword = process.env.MASTER_PASSWORD;

      if (!envMasterPassword) {
        throw new Error("Master password not configured on server");
      }

      if (masterPassword !== envMasterPassword) {
        throw new Error("Invalid master password");
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
    });

    // Generate token for immediate login
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  private generateToken(user: { id: number }) {
    return jwt.sign(
      {
        userId: user.id,
        type: "admin",
      },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );
  }
}
