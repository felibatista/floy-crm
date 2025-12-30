import { Request, Response } from "express";
import { ArcaService } from "./arca.service";

const arcaService = new ArcaService();

export class ArcaController {
  /**
   * Get ARCA configuration for current user
   */
  async getConfig(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const config = await arcaService.getConfig(userId);

      // Don't send the actual certificate/key content, just indicate if they exist
      if (config) {
        res.json({
          ...config,
          certificado: config.certificado ? "[CONFIGURED]" : null,
          clavePrivada: config.clavePrivada ? "[CONFIGURED]" : null,
          hasCertificate: !!config.certificado && !!config.clavePrivada,
        });
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching ARCA config:", error);
      res.status(500).json({ error: "Failed to fetch ARCA config" });
    }
  }

  /**
   * Save ARCA configuration
   */
  async saveConfig(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const {
        cuit,
        razonSocial,
        domicilioFiscal,
        puntoVenta,
        condicionIva,
        iibb,
        inicioActividad,
      } = req.body;

      if (!cuit || !razonSocial) {
        return res.status(400).json({ error: "CUIT and Razón Social are required" });
      }

      const config = await arcaService.saveConfig(userId, {
        cuit,
        razonSocial,
        domicilioFiscal,
        puntoVenta: puntoVenta || 1,
        condicionIva: condicionIva || "monotributo",
      });

      res.json({
        ...config,
        certificado: config.certificado ? "[CONFIGURED]" : null,
        clavePrivada: config.clavePrivada ? "[CONFIGURED]" : null,
        hasCertificate: !!config.certificado && !!config.clavePrivada,
      });
    } catch (error) {
      console.error("Error saving ARCA config:", error);
      res.status(500).json({ error: "Failed to save ARCA config" });
    }
  }

  /**
   * Upload certificate and private key
   */
  async uploadCertificate(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { certificado, clavePrivada } = req.body;

      if (!certificado || !clavePrivada) {
        return res.status(400).json({ error: "Certificate and private key are required" });
      }

      const config = await arcaService.uploadCertificate(userId, certificado, clavePrivada);

      res.json({
        success: true,
        message: "Certificate uploaded successfully",
        hasCertificate: true,
      });
    } catch (error) {
      console.error("Error uploading certificate:", error);
      res.status(500).json({ error: "Failed to upload certificate" });
    }
  }

  /**
   * Validate certificate
   */
  async validateCertificate(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const result = await arcaService.validateCertificate(userId);
      res.json(result);
    } catch (error) {
      console.error("Error validating certificate:", error);
      res.status(500).json({ error: "Failed to validate certificate" });
    }
  }

  /**
   * Get next invoice number
   */
  async getNextInvoiceNumber(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const tipoComprobante = req.query.tipo as any || "factura_c";
      const numero = await arcaService.getNextInvoiceNumber(userId, tipoComprobante);

      res.json({ numero });
    } catch (error) {
      console.error("Error getting next invoice number:", error);
      res.status(500).json({ error: "Failed to get next invoice number" });
    }
  }

  /**
   * Authorize invoice with AFIP
   */
  async authorizeInvoice(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const invoiceId = parseInt(req.params.invoiceId);
      if (isNaN(invoiceId)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      const result = await arcaService.authorizeInvoice(userId, invoiceId);

      if (result.success) {
        res.json({
          success: true,
          message: "Invoice authorized successfully",
          numero: result.numero,
          cae: result.cae,
          caeVencimiento: result.caeVencimiento,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.errorMessage,
        });
      }
    } catch (error) {
      console.error("Error authorizing invoice:", error);
      res.status(500).json({ error: "Failed to authorize invoice" });
    }
  }

  /**
   * Cancel invoice (create credit note)
   */
  async cancelInvoice(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const invoiceId = parseInt(req.params.invoiceId);
      if (isNaN(invoiceId)) {
        return res.status(400).json({ error: "Invalid invoice ID" });
      }

      const result = await arcaService.cancelInvoice(userId, invoiceId);

      if (result.success) {
        res.json({
          success: true,
          message: "Credit note created successfully",
          creditNoteId: result.creditNoteId,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.errorMessage,
        });
      }
    } catch (error) {
      console.error("Error cancelling invoice:", error);
      res.status(500).json({ error: "Failed to cancel invoice" });
    }
  }

  /**
   * Generate new certificate (private key + CSR info)
   */
  async generateCertificate(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { cuit, razonSocial } = req.body;

      if (!cuit || !razonSocial) {
        return res.status(400).json({ error: "CUIT and Razón Social are required" });
      }

      const result = await arcaService.generateCertificateSimple(userId, {
        cuit,
        razonSocial,
      });

      if (result.success) {
        res.json({
          success: true,
          message: "Clave privada generada correctamente",
          privateKey: result.privateKey,
          opensslCommand: result.opensslCommand,
          instructions: [
            "1. Guarda la clave privada en un archivo llamado 'private.key'",
            "2. Ejecuta el comando OpenSSL proporcionado para generar el CSR",
            "3. Sube el archivo CSR (request.csr) a AFIP en 'Administrar Certificados'",
            "4. Descarga el certificado firmado por AFIP (.crt)",
            "5. Sube el certificado en la sección 'Subir Certificado' de esta página",
          ],
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.errorMessage,
        });
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ error: "Failed to generate certificate" });
    }
  }
}
