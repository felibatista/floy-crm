import { Request, Response } from "express";
import { BillingService } from "./billing.service";
import { ArcaInvoiceStatus } from "@prisma/client";
import { arcaService } from "./arca.service";
import { pdfService } from "./pdf.service";

const billingService = new BillingService();

export class BillingController {
  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const search = req.query.search as string | undefined;
      const status = req.query.status as ArcaInvoiceStatus | undefined;
      const projectId = req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined;

      const result = await billingService.list({
        page,
        limit,
        search,
        status,
        projectId,
      });
      res.json(result);
    } catch (error) {
      console.error("Error listing invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      const invoice = await billingService.getById(id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  }

  async getByProjectId(req: Request, res: Response) {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const invoices = await billingService.getByProjectId(projectId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices by project:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  }

  async getByPaymentId(req: Request, res: Response) {
    try {
      const paymentId = parseInt(req.params.paymentId);
      if (isNaN(paymentId)) {
        return res.status(400).json({ error: "Invalid payment ID" });
      }

      const invoices = await billingService.getByPaymentId(paymentId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices by payment:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const {
        projectId,
        paymentId,
        tipoComprobante,
        puntoVenta,
        receptorNombre,
        receptorCuit,
        receptorDomicilio,
        importeNeto,
        importeTotal,
        moneda,
        concepto,
        conceptoTipo,
        periodoDesde,
        periodoHasta,
        vencimientoPago,
      } = req.body;

      if (!receptorNombre || !importeNeto || !importeTotal || !concepto) {
        return res.status(400).json({
          error: "receptorNombre, importeNeto, importeTotal and concepto are required",
        });
      }

      // Get punto de venta from ARCA config if not provided
      let puntoVentaFinal = puntoVenta ? parseInt(puntoVenta) : undefined;
      if (!puntoVentaFinal) {
        const arcaConfig = await arcaService.getConfig(userId);
        puntoVentaFinal = arcaConfig?.puntoVenta || 1;
      }

      const invoice = await billingService.create({
        userId,
        projectId: projectId ? parseInt(projectId) : undefined,
        paymentId: paymentId ? parseInt(paymentId) : undefined,
        tipoComprobante,
        puntoVenta: puntoVentaFinal,
        receptorNombre,
        receptorCuit,
        receptorDomicilio,
        importeNeto: parseFloat(importeNeto),
        importeTotal: parseFloat(importeTotal),
        moneda,
        concepto,
        conceptoTipo,
        periodoDesde: periodoDesde ? new Date(periodoDesde) : undefined,
        periodoHasta: periodoHasta ? new Date(periodoHasta) : undefined,
        vencimientoPago: vencimientoPago ? new Date(vencimientoPago) : undefined,
      });

      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      const existing = await billingService.getById(id);
      if (!existing) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      if (existing.status === "authorized") {
        return res.status(400).json({ error: "Cannot modify authorized invoice" });
      }

      const {
        tipoComprobante,
        receptorNombre,
        receptorCuit,
        receptorDomicilio,
        importeNeto,
        importeTotal,
        moneda,
        concepto,
        conceptoTipo,
        periodoDesde,
        periodoHasta,
        vencimientoPago,
        projectId,
        paymentId,
      } = req.body;

      const invoice = await billingService.update(id, {
        tipoComprobante,
        receptorNombre,
        receptorCuit,
        receptorDomicilio,
        importeNeto: importeNeto ? parseFloat(importeNeto) : undefined,
        importeTotal: importeTotal ? parseFloat(importeTotal) : undefined,
        moneda,
        concepto,
        conceptoTipo,
        periodoDesde: periodoDesde ? new Date(periodoDesde) : undefined,
        periodoHasta: periodoHasta ? new Date(periodoHasta) : undefined,
        vencimientoPago: vencimientoPago ? new Date(vencimientoPago) : undefined,
        projectId: projectId !== undefined ? (projectId ? parseInt(projectId) : undefined) : undefined,
        paymentId: paymentId !== undefined ? (paymentId ? parseInt(paymentId) : undefined) : undefined,
      });

      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ error: "Failed to update invoice" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      const existing = await billingService.getById(id);
      if (!existing) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      if (existing.status === "authorized") {
        return res.status(400).json({ error: "Cannot delete authorized invoice" });
      }

      await billingService.delete(id);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  }

  async linkToPayment(req: Request, res: Response) {
    try {
      const invoiceId = parseInt(req.params.id);
      const { paymentId } = req.body;

      if (isNaN(invoiceId)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      if (!paymentId) {
        return res.status(400).json({ error: "paymentId is required" });
      }

      const invoice = await billingService.linkToPayment(invoiceId, parseInt(paymentId));
      res.json(invoice);
    } catch (error) {
      console.error("Error linking invoice to payment:", error);
      res.status(500).json({ error: "Failed to link invoice to payment" });
    }
  }

  async linkToProject(req: Request, res: Response) {
    try {
      const invoiceId = parseInt(req.params.id);
      const { projectId } = req.body;

      if (isNaN(invoiceId)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      if (!projectId) {
        return res.status(400).json({ error: "projectId is required" });
      }

      const invoice = await billingService.linkToProject(invoiceId, parseInt(projectId));
      res.json(invoice);
    } catch (error) {
      console.error("Error linking invoice to project:", error);
      res.status(500).json({ error: "Failed to link invoice to project" });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await billingService.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching billing stats:", error);
      res.status(500).json({ error: "Failed to fetch billing stats" });
    }
  }

  async downloadPdf(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      // Get invoice data
      const invoice = await billingService.getById(id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Only authorized invoices can be downloaded as PDF
      if (invoice.status !== "authorized" || !invoice.cae) {
        return res.status(400).json({
          error: "Solo se pueden descargar facturas autorizadas con CAE",
        });
      }

      // Get ARCA config for emitter data
      const arcaConfig = await arcaService.getConfig(userId);
      if (!arcaConfig) {
        return res.status(400).json({
          error: "No hay configuración ARCA para este usuario",
        });
      }

      // Generate QR code URL
      const qrCodeUrl = arcaService.generateQRData(arcaConfig, invoice);
      // Use Google Charts API for QR (simple approach)
      const qrImageUrl = `https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(qrCodeUrl)}`;

      // Prepare invoice data for PDF
      const pdfData = {
        // Emisor
        razonSocial: arcaConfig.razonSocial,
        domicilioFiscal: arcaConfig.domicilioFiscal || "",
        cuitEmisor: arcaConfig.cuit,
        condicionIva: this.getCondicionIvaTexto(arcaConfig.condicionIva),

        // Comprobante
        tipoComprobante: invoice.tipoComprobante,
        puntoVenta: invoice.puntoVenta,
        numero: invoice.numero!,
        fechaEmision: invoice.fechaEmision || new Date(),

        // Receptor
        receptorNombre: invoice.receptorNombre,
        receptorCuit: invoice.receptorCuit || undefined,
        receptorCondicionIva: invoice.receptorCondicionIva || 5,
        receptorDomicilio: invoice.receptorDomicilio || undefined,

        // Importes
        importeNeto: Number(invoice.importeNeto),
        importeTotal: Number(invoice.importeTotal),
        moneda: invoice.moneda || "PES",

        // Concepto
        concepto: invoice.concepto,
        conceptoTipo: invoice.conceptoTipo,
        periodoDesde: invoice.periodoDesde || undefined,
        periodoHasta: invoice.periodoHasta || undefined,
        vencimientoPago: invoice.vencimientoPago || undefined,

        // CAE
        cae: invoice.cae,
        caeVencimiento: invoice.caeVencimiento!,

        // QR
        qrCodeUrl: qrImageUrl,
      };

      // Generate PDF
      const pdfBuffer = await pdfService.generatePdf(pdfData);
      const filename = pdfService.generateFilename(pdfData);

      // Send PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }

  private getCondicionIvaTexto(condicion: string): string {
    const map: Record<string, string> = {
      monotributo: "Responsable Monotributo",
      responsable_inscripto: "IVA Responsable Inscripto",
      exento: "IVA Sujeto Exento",
    };
    return map[condicion] || condicion;
  }
}
