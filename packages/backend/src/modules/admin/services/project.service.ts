import { prisma } from "../../../lib/prisma";

export class ProjectService {
  async list() {
    return prisma.project.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        client: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async getById(id: number) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, name: true },
        },
        tasks: true,
      },
    });
  }
}

export const projectService = new ProjectService();
