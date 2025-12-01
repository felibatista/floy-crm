import { prisma } from "../../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  async validatePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  generateToken(client: { id: string; slug: string }) {
    return jwt.sign(
      {
        clientId: client.id,
        slug: client.slug,
        type: "portal",
      },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" }
    );
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async updateClientPassword(id: number, passwordHash: string) {
    return await prisma.client.update({
      where: { id },
      data: { passwordHash },
    });
  }
}
