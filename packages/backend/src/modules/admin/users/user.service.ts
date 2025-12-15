import { prisma } from "../../../lib/prisma";

export class UserService {
  async list() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

export const userService = new UserService();
