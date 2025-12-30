import { prisma } from "../../../lib/prisma";
import { Prisma, ArcaInvoiceStatus, ArcaInvoiceType } from "@prisma/client";

interface ListInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ArcaInvoiceStatus;
  projectId?: number;
  userId?: number;
}

interface CreateInvoiceData {
  userId: number;
  projectId?: number;
  paymentId?: number;
  tipoComprobante?: ArcaInvoiceType;
  puntoVenta: number;
  receptorNombre: string;
  receptorCuit?: string;
  receptorDomicilio?: string;
  importeNeto: number;
  importeTotal: number;
  moneda?: string;
  concepto: string;
  conceptoTipo?: number;
  periodoDesde?: Date;
  periodoHasta?: Date;
  vencimientoPago?: Date;
}

interface UpdateInvoiceData {
  tipoComprobante?: ArcaInvoiceType;
  receptorNombre?: string;
  receptorCuit?: string;
  receptorDomicilio?: string;
  importeNeto?: number;
  importeTotal?: number;
  moneda?: string;
  concepto?: string;
  conceptoTipo?: number;
  periodoDesde?: Date;
  periodoHasta?: Date;
  vencimientoPago?: Date;
  status?: ArcaInvoiceStatus;
  cae?: string;
  caeVencimiento?: Date;
  pdfUrl?: string;
  pdfFilename?: string;
  afipResponse?: string;
  errorMessage?: string;
  projectId?: number;
  paymentId?: number;
}

export class BillingService {
  async list(params: ListInvoicesParams = {}) {
    const { page = 1, limit = 50, search, status, projectId, userId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.ArcaInvoiceWhereInput = {};

    if (search) {
      where.OR = [
        { receptorNombre: { contains: search, mode: "insensitive" } },
        { receptorCuit: { contains: search, mode: "insensitive" } },
        { concepto: { contains: search, mode: "insensitive" } },
        { cae: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (userId) {
      where.userId = userId;
    }

    const [invoices, total] = await Promise.all([
      prisma.arcaInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaEmision: "desc" },
        include: {
          User: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: {
              id: true,
              name: true,
              client: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
          payment: {
            select: { id: true, amount: true, concept: true, status: true },
          },
        },
      }),
      prisma.arcaInvoice.count({ where }),
    ]);

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    return await prisma.arcaInvoice.findUnique({
      where: { id },
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        payment: {
          select: { id: true, amount: true, concept: true, status: true, projectId: true },
        },
      },
    });
  }

  async getByProjectId(projectId: number) {
    return await prisma.arcaInvoice.findMany({
      where: { projectId },
      orderBy: { fechaEmision: "desc" },
      include: {
        User: {
          select: { id: true, name: true },
        },
        payment: {
          select: { id: true, amount: true, concept: true, status: true },
        },
      },
    });
  }

  async getByPaymentId(paymentId: number) {
    return await prisma.arcaInvoice.findMany({
      where: { paymentId },
      orderBy: { fechaEmision: "desc" },
      include: {
        User: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async create(data: CreateInvoiceData) {
    return await prisma.arcaInvoice.create({
      data: {
        userId: data.userId,
        projectId: data.projectId,
        paymentId: data.paymentId,
        tipoComprobante: data.tipoComprobante || "factura_c",
        puntoVenta: data.puntoVenta,
        receptorNombre: data.receptorNombre,
        receptorCuit: data.receptorCuit,
        receptorDomicilio: data.receptorDomicilio,
        importeNeto: data.importeNeto,
        importeTotal: data.importeTotal,
        moneda: data.moneda || "PES",
        concepto: data.concepto,
        conceptoTipo: data.conceptoTipo || 2,
        periodoDesde: data.periodoDesde,
        periodoHasta: data.periodoHasta,
        vencimientoPago: data.vencimientoPago,
        status: "draft",
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true },
        },
        payment: {
          select: { id: true, amount: true, concept: true },
        },
      },
    });
  }

  async update(id: number, data: UpdateInvoiceData) {
    return await prisma.arcaInvoice.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true },
        },
        payment: {
          select: { id: true, amount: true, concept: true },
        },
      },
    });
  }

  async delete(id: number) {
    return await prisma.arcaInvoice.delete({
      where: { id },
    });
  }

  async linkToPayment(invoiceId: number, paymentId: number) {
    return await prisma.arcaInvoice.update({
      where: { id: invoiceId },
      data: {
        paymentId,
        updatedAt: new Date(),
      },
    });
  }

  async linkToProject(invoiceId: number, projectId: number) {
    return await prisma.arcaInvoice.update({
      where: { id: invoiceId },
      data: {
        projectId,
        updatedAt: new Date(),
      },
    });
  }

  async updateAfterAuthorization(id: number, data: {
    numero: number;
    cae: string;
    caeVencimiento: Date;
    afipResponse: string;
    status: ArcaInvoiceStatus;
  }) {
    return await prisma.arcaInvoice.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async getStats(userId?: number) {
    const where: Prisma.ArcaInvoiceWhereInput = userId ? { userId } : {};

    const [total, draft, pending, authorized, rejected] = await Promise.all([
      prisma.arcaInvoice.count({ where }),
      prisma.arcaInvoice.count({ where: { ...where, status: "draft" } }),
      prisma.arcaInvoice.count({ where: { ...where, status: "pending" } }),
      prisma.arcaInvoice.count({ where: { ...where, status: "authorized" } }),
      prisma.arcaInvoice.count({ where: { ...where, status: "rejected" } }),
    ]);

    const totalAmount = await prisma.arcaInvoice.aggregate({
      where: { ...where, status: "authorized" },
      _sum: { importeTotal: true },
    });

    return {
      total,
      draft,
      pending,
      authorized,
      rejected,
      totalAuthorizedAmount: totalAmount._sum.importeTotal || 0,
    };
  }
}

export const billingService = new BillingService();
