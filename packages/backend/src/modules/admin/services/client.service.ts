import { prisma } from "../../../lib/prisma";

interface ListClientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  slug: string;
  isPortalEnabled?: boolean;
}

interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  slug?: string;
  isPortalEnabled?: boolean;
}

export class ClientService {
  async list(params: ListClientsParams = {}) {
    const { page = 1, limit = 50, search } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { projects: true, tickets: true },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
        },
        tickets: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { projects: true, tickets: true },
        },
      },
    });
  }

  async getBySlug(slug: string) {
    return await prisma.client.findUnique({
      where: { slug },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
        },
        tickets: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { projects: true, tickets: true },
        },
      },
    });
  }

  async create(data: CreateClientData) {
    return await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        address: data.address,
        slug: data.slug,
        isPortalEnabled: data.isPortalEnabled || false,
      },
      include: {
        _count: {
          select: { projects: true, tickets: true },
        },
      },
    });
  }

  async update(id: number, data: UpdateClientData) {
    return await prisma.client.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { projects: true, tickets: true },
        },
      },
    });
  }

  async delete(id: number) {
    return await prisma.client.delete({
      where: { id },
    });
  }

  async checkSlugExists(slug: string, excludeId?: number) {
    const existing = await prisma.client.findUnique({
      where: { slug },
    });

    if (!existing) return false;
    if (excludeId && existing.id === excludeId) return false;
    return true;
  }
}
