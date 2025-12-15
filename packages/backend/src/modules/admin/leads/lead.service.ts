import { prisma } from "../../../lib/prisma";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

interface ListLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
}

interface CreateLeadData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: LeadStatus;
  notes?: string;
}

interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: LeadStatus;
  notes?: string;
}

interface ConvertToClientData {
  slug: string;
  address?: string;
  isPortalEnabled?: boolean;
}

export class LeadService {
  async list(params: ListLeadsParams = {}) {
    const { page = 1, limit = 50, search, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { company: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    return await prisma.lead.findUnique({
      where: { id },
    });
  }

  async create(data: CreateLeadData) {
    return await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        status: data.status || "new",
        notes: data.notes,
      },
    });
  }

  async update(id: number, data: UpdateLeadData) {
    return await prisma.lead.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await prisma.lead.delete({
      where: { id },
    });
  }

  async convertToClient(id: number, data: ConvertToClientData) {
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new Error("Lead not found");
    }

    const existingClient = await prisma.client.findUnique({
      where: { slug: data.slug },
    });

    if (existingClient) {
      throw new Error("Slug already exists");
    }

    if (lead.email) {
      const existingEmail = await prisma.client.findUnique({
        where: { email: lead.email },
      });

      if (existingEmail) {
        throw new Error("Email already exists as client");
      }
    }

    const [client] = await prisma.$transaction([
      prisma.client.create({
        data: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          slug: data.slug,
          address: data.address,
          isPortalEnabled: data.isPortalEnabled || false,
        },
        include: {
          _count: {
            select: { projects: true, tickets: true },
          },
        },
      }),
      prisma.lead.update({
        where: { id },
        data: { status: "converted" },
      }),
    ]);

    return client;
  }
}
