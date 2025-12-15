import { prisma } from "../../../lib/prisma";

export class ProjectService {
  async list(clientId?: number) {
    const where = clientId ? { clientId } : {};

    return prisma.project.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { tasks: true },
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
          select: { id: true, name: true, slug: true },
        },
        tasks: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            priority: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { tasks: true },
        },
      },
    });
  }

  async getByClientSlug(slug: string) {
    return prisma.project.findMany({
      where: {
        client: { slug },
      },
      include: {
        client: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }
}

export const projectService = new ProjectService();
