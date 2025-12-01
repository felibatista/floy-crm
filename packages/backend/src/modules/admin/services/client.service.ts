import { prisma } from "../../../lib/prisma";

export class ClientService {
  async getAllClients() {
    return await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { projects: true, tickets: true },
        },
      },
    });
  }

  async getClientBySlug(slug: string) {
    return await prisma.client.findUnique({ where: { slug } });
  }

  async createClient(data: {
    name: string;
    email: string;
    slug: string;
    isPortalEnabled: boolean;
  }) {
    return await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        slug: data.slug,
        isPortalEnabled: data.isPortalEnabled || false,
      },
    });
  }

  // async updateClient(id: string, data: any) {
  //   return await prisma.client.update({
  //     where: { id },
  //     data,
  //   });
  // }
}
