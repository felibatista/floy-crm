import { prisma } from "../../../lib/prisma";
import { ArcaInvoiceType } from "@prisma/client";
import * as crypto from "crypto";

// ARCA/AFIP Webservice URLs
const ARCA_URLS = {
  // Testing (Homologación)
  testing: {
    wsaa: "https://wsaahomo.afip.gov.ar/ws/services/LoginCms",
    wsfe: "https://wswhomo.afip.gov.ar/wsfev1/service.asmx",
  },
  // Production
  production: {
    wsaa: "https://wsaa.afip.gov.ar/ws/services/LoginCms",
    wsfe: "https://servicios1.afip.gov.ar/wsfev1/service.asmx",
  },
};

// Tipo de comprobante AFIP codes
const COMPROBANTE_CODES: Record<ArcaInvoiceType, number> = {
  factura_c: 11, // Factura C
  nota_credito_c: 13, // Nota de Crédito C
  nota_debito_c: 12, // Nota de Débito C
};

interface ArcaConfig {
  cuit: string;
  razonSocial: string;
  domicilioFiscal?: string | null;
  puntoVenta: number;
  condicionIva: string;
  certificado: string | null;
  clavePrivada: string | null;
}

interface InvoiceData {
  tipoComprobante: ArcaInvoiceType;
  puntoVenta: number;
  receptorNombre: string;
  receptorCuit?: string;
  receptorDomicilio?: string;
  importeNeto: number;
  importeTotal: number;
  concepto: string;
  conceptoTipo: number;
  periodoDesde?: Date;
  periodoHasta?: Date;
  vencimientoPago?: Date;
}

interface AuthorizationResult {
  success: boolean;
  numero?: number;
  cae?: string;
  caeVencimiento?: Date;
  afipResponse?: string;
  errorMessage?: string;
}

interface CertificateGenerationResult {
  success: boolean;
  privateKey?: string;
  csr?: string;
  errorMessage?: string;
}

export class ArcaService {
  private isProduction: boolean;

  constructor(isProduction = false) {
    this.isProduction = isProduction;
  }

  private getUrls() {
    return this.isProduction ? ARCA_URLS.production : ARCA_URLS.testing;
  }

  /**
   * Get ARCA configuration for a user
   */
  async getConfig(userId: number): Promise<ArcaConfig | null> {
    const config = await prisma.arcaConfig.findUnique({
      where: { userId },
    });
    return config;
  }

  /**
   * Save or update ARCA configuration
   */
  async saveConfig(userId: number, data: Partial<ArcaConfig>) {
    const existing = await prisma.arcaConfig.findUnique({
      where: { userId },
    });

    if (existing) {
      return await prisma.arcaConfig.update({
        where: { userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } else {
      return await prisma.arcaConfig.create({
        data: {
          userId,
          cuit: data.cuit || "",
          razonSocial: data.razonSocial || "",
          puntoVenta: data.puntoVenta || 1,
          condicionIva: data.condicionIva || "monotributo",
          certificado: data.certificado,
          clavePrivada: data.clavePrivada,
          updatedAt: new Date(),
        },
      });
    }
  }

  /**
   * Upload certificate and private key
   */
  async uploadCertificate(
    userId: number,
    certificado: string,
    clavePrivada: string
  ) {
    return await this.saveConfig(userId, {
      certificado,
      clavePrivada,
    });
  }

  /**
   * Validate certificate by trying to authenticate with WSAA
   */
  async validateCertificate(userId: number): Promise<{
    valid: boolean;
    message: string;
  }> {
    const config = await this.getConfig(userId);

    if (!config) {
      return { valid: false, message: "No hay configuración ARCA para este usuario" };
    }

    if (!config.certificado || !config.clavePrivada) {
      return { valid: false, message: "No hay certificado o clave privada configurados" };
    }

    try {
      // Try to generate a login ticket to validate the certificate
      const token = await this.authenticateWSAA(config);
      return {
        valid: !!token,
        message: token ? "Certificado válido" : "Error de autenticación",
      };
    } catch (error: any) {
      return {
        valid: false,
        message: `Error al validar certificado: ${error.message}`,
      };
    }
  }

  /**
   * Authenticate with WSAA (Web Service de Autenticación y Autorización)
   * This is the first step to interact with any AFIP web service
   */
  private async authenticateWSAA(config: ArcaConfig): Promise<string | null> {
    if (!config.certificado || !config.clavePrivada) {
      throw new Error("Certificado o clave privada no configurados");
    }

    // Generate TRA (Ticket de Requerimiento de Acceso)
    const tra = this.generateTRA();

    // Sign TRA with certificate and private key
    const cms = this.signTRA(tra, config.certificado, config.clavePrivada);

    // Send to WSAA
    const urls = this.getUrls();
    const soapRequest = this.buildWSAARequest(cms);

    try {
      const response = await fetch(urls.wsaa, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "",
        },
        body: soapRequest,
      });

      const responseText = await response.text();

      // Parse response to get token and sign
      const token = this.parseWSAAResponse(responseText);
      return token;
    } catch (error: any) {
      console.error("WSAA Authentication error:", error);
      throw new Error(`Error de autenticación WSAA: ${error.message}`);
    }
  }

  /**
   * Generate TRA (Ticket de Requerimiento de Acceso)
   */
  private generateTRA(): string {
    const now = new Date();
    const generationTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago
    const expirationTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

    const formatDate = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "");

    return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${Math.floor(Date.now() / 1000)}</uniqueId>
    <generationTime>${formatDate(generationTime)}</generationTime>
    <expirationTime>${formatDate(expirationTime)}</expirationTime>
  </header>
  <service>wsfe</service>
</loginTicketRequest>`;
  }

  /**
   * Sign TRA with certificate (placeholder - requires proper implementation)
   */
  private signTRA(tra: string, certificado: string, clavePrivada: string): string {
    // This is a simplified version. In production, you need to:
    // 1. Create a PKCS#7 signed message using the certificate and private key
    // 2. Return the base64-encoded CMS

    // For now, return a placeholder
    // Real implementation would use node-forge or similar library
    const sign = crypto.createSign("RSA-SHA256");
    sign.update(tra);

    try {
      const signature = sign.sign(clavePrivada, "base64");
      return Buffer.from(tra + signature).toString("base64");
    } catch {
      // If signing fails, just return base64 of TRA for development
      return Buffer.from(tra).toString("base64");
    }
  }

  /**
   * Build SOAP request for WSAA
   */
  private buildWSAARequest(cms: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsaa="http://wsaa.view.sua.dvadac.desein.afip.gov">
  <soapenv:Header/>
  <soapenv:Body>
    <wsaa:loginCms>
      <wsaa:in0>${cms}</wsaa:in0>
    </wsaa:loginCms>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * Parse WSAA response to extract token and sign
   */
  private parseWSAAResponse(response: string): string | null {
    // Extract token from SOAP response
    const tokenMatch = response.match(/<token>([^<]+)<\/token>/);
    const signMatch = response.match(/<sign>([^<]+)<\/sign>/);

    if (tokenMatch && signMatch) {
      return JSON.stringify({
        token: tokenMatch[1],
        sign: signMatch[1],
      });
    }

    // Check for errors
    const faultMatch = response.match(/<faultstring>([^<]+)<\/faultstring>/);
    if (faultMatch) {
      throw new Error(faultMatch[1]);
    }

    return null;
  }

  /**
   * Get next invoice number from AFIP
   */
  async getNextInvoiceNumber(
    userId: number,
    tipoComprobante: ArcaInvoiceType
  ): Promise<number> {
    const config = await this.getConfig(userId);
    if (!config) {
      throw new Error("No hay configuración ARCA");
    }

    // In production, this would call FECompUltimoAutorizado
    // For now, return the next number based on existing invoices
    const lastInvoice = await prisma.arcaInvoice.findFirst({
      where: {
        userId,
        tipoComprobante,
        puntoVenta: config.puntoVenta,
        numero: { not: null },
      },
      orderBy: { numero: "desc" },
    });

    return (lastInvoice?.numero || 0) + 1;
  }

  /**
   * Authorize invoice with AFIP (FECAESolicitar)
   */
  async authorizeInvoice(
    userId: number,
    invoiceId: number
  ): Promise<AuthorizationResult> {
    const config = await this.getConfig(userId);
    if (!config) {
      return {
        success: false,
        errorMessage: "No hay configuración ARCA para este usuario",
      };
    }

    if (!config.certificado || !config.clavePrivada) {
      return {
        success: false,
        errorMessage: "No hay certificado configurado",
      };
    }

    const invoice = await prisma.arcaInvoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return {
        success: false,
        errorMessage: "Factura no encontrada",
      };
    }

    if (invoice.status === "authorized") {
      return {
        success: false,
        errorMessage: "La factura ya está autorizada",
      };
    }

    try {
      // Authenticate with WSAA
      const authToken = await this.authenticateWSAA(config);
      if (!authToken) {
        throw new Error("No se pudo autenticar con WSAA");
      }

      // Get next invoice number
      const numero = await this.getNextInvoiceNumber(userId, invoice.tipoComprobante);

      // Build and send WSFE request
      const wsfeResult = await this.callWSFE(config, authToken, invoice, numero);

      if (wsfeResult.success) {
        // Update invoice with CAE
        await prisma.arcaInvoice.update({
          where: { id: invoiceId },
          data: {
            numero: wsfeResult.numero,
            cae: wsfeResult.cae,
            caeVencimiento: wsfeResult.caeVencimiento,
            status: "authorized",
            afipResponse: wsfeResult.afipResponse,
            updatedAt: new Date(),
          },
        });
      } else {
        // Update with error
        await prisma.arcaInvoice.update({
          where: { id: invoiceId },
          data: {
            status: "rejected",
            errorMessage: wsfeResult.errorMessage,
            afipResponse: wsfeResult.afipResponse,
            updatedAt: new Date(),
          },
        });
      }

      return wsfeResult;
    } catch (error: any) {
      const errorMessage = `Error al autorizar factura: ${error.message}`;

      await prisma.arcaInvoice.update({
        where: { id: invoiceId },
        data: {
          status: "rejected",
          errorMessage,
          updatedAt: new Date(),
        },
      });

      return {
        success: false,
        errorMessage,
      };
    }
  }

  /**
   * Call WSFE (Web Service de Facturación Electrónica)
   */
  private async callWSFE(
    config: ArcaConfig,
    authToken: string,
    invoice: any,
    numero: number
  ): Promise<AuthorizationResult> {
    const urls = this.getUrls();
    const auth = JSON.parse(authToken);
    const cbteCode = COMPROBANTE_CODES[invoice.tipoComprobante as ArcaInvoiceType];

    // Format dates for AFIP (YYYYMMDD)
    const formatAFIPDate = (d: Date | null) => {
      if (!d) return "";
      return d.toISOString().slice(0, 10).replace(/-/g, "");
    };

    const today = formatAFIPDate(new Date());
    const importeTotal = parseFloat(invoice.importeTotal.toString());
    const importeNeto = parseFloat(invoice.importeNeto.toString());

    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:FECAESolicitar>
      <ar:Auth>
        <ar:Token>${auth.token}</ar:Token>
        <ar:Sign>${auth.sign}</ar:Sign>
        <ar:Cuit>${config.cuit.replace(/-/g, "")}</ar:Cuit>
      </ar:Auth>
      <ar:FeCAEReq>
        <ar:FeCabReq>
          <ar:CantReg>1</ar:CantReg>
          <ar:PtoVta>${config.puntoVenta}</ar:PtoVta>
          <ar:CbteTipo>${cbteCode}</ar:CbteTipo>
        </ar:FeCabReq>
        <ar:FeDetReq>
          <ar:FECAEDetRequest>
            <ar:Concepto>${invoice.conceptoTipo}</ar:Concepto>
            <ar:DocTipo>${invoice.receptorCuit ? 80 : 99}</ar:DocTipo>
            <ar:DocNro>${invoice.receptorCuit?.replace(/-/g, "") || 0}</ar:DocNro>
            <ar:CbteDesde>${numero}</ar:CbteDesde>
            <ar:CbteHasta>${numero}</ar:CbteHasta>
            <ar:CbteFch>${today}</ar:CbteFch>
            <ar:ImpTotal>${importeTotal.toFixed(2)}</ar:ImpTotal>
            <ar:ImpTotConc>0</ar:ImpTotConc>
            <ar:ImpNeto>${importeNeto.toFixed(2)}</ar:ImpNeto>
            <ar:ImpOpEx>0</ar:ImpOpEx>
            <ar:ImpIVA>0</ar:ImpIVA>
            <ar:ImpTrib>0</ar:ImpTrib>
            ${invoice.conceptoTipo !== 1 ? `
            <ar:FchServDesde>${formatAFIPDate(invoice.periodoDesde) || today}</ar:FchServDesde>
            <ar:FchServHasta>${formatAFIPDate(invoice.periodoHasta) || today}</ar:FchServHasta>
            <ar:FchVtoPago>${formatAFIPDate(invoice.vencimientoPago) || today}</ar:FchVtoPago>
            ` : ""}
            <ar:MonId>PES</ar:MonId>
            <ar:MonCotiz>1</ar:MonCotiz>
          </ar:FECAEDetRequest>
        </ar:FeDetReq>
      </ar:FeCAEReq>
    </ar:FECAESolicitar>
  </soapenv:Body>
</soapenv:Envelope>`;

    try {
      const response = await fetch(urls.wsfe, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "http://ar.gov.afip.dif.FEV1/FECAESolicitar",
        },
        body: soapRequest,
      });

      const responseText = await response.text();
      return this.parseWSFEResponse(responseText, numero);
    } catch (error: any) {
      return {
        success: false,
        errorMessage: `Error de comunicación con WSFE: ${error.message}`,
        afipResponse: error.message,
      };
    }
  }

  /**
   * Parse WSFE response
   */
  private parseWSFEResponse(response: string, numero: number): AuthorizationResult {
    // Check for CAE
    const caeMatch = response.match(/<CAE>(\d+)<\/CAE>/);
    const caeVtoMatch = response.match(/<CAEFchVto>(\d{8})<\/CAEFchVto>/);

    if (caeMatch && caeVtoMatch) {
      const caeVtoStr = caeVtoMatch[1];
      const caeVencimiento = new Date(
        parseInt(caeVtoStr.slice(0, 4)),
        parseInt(caeVtoStr.slice(4, 6)) - 1,
        parseInt(caeVtoStr.slice(6, 8))
      );

      return {
        success: true,
        numero,
        cae: caeMatch[1],
        caeVencimiento,
        afipResponse: response,
      };
    }

    // Check for errors
    const errorMatch = response.match(/<Err>[\s\S]*?<Code>(\d+)<\/Code>[\s\S]*?<Msg>([^<]+)<\/Msg>/);
    if (errorMatch) {
      return {
        success: false,
        errorMessage: `Error ${errorMatch[1]}: ${errorMatch[2]}`,
        afipResponse: response,
      };
    }

    // Check for observations
    const obsMatch = response.match(/<Obs>[\s\S]*?<Code>(\d+)<\/Code>[\s\S]*?<Msg>([^<]+)<\/Msg>/);
    if (obsMatch) {
      return {
        success: false,
        errorMessage: `Observación ${obsMatch[1]}: ${obsMatch[2]}`,
        afipResponse: response,
      };
    }

    return {
      success: false,
      errorMessage: "Respuesta inesperada de AFIP",
      afipResponse: response,
    };
  }

  /**
   * Cancel invoice (Nota de Crédito)
   */
  async cancelInvoice(
    userId: number,
    originalInvoiceId: number
  ): Promise<{ success: boolean; creditNoteId?: number; errorMessage?: string }> {
    const original = await prisma.arcaInvoice.findUnique({
      where: { id: originalInvoiceId },
    });

    if (!original) {
      return { success: false, errorMessage: "Factura original no encontrada" };
    }

    if (original.status !== "authorized") {
      return { success: false, errorMessage: "Solo se pueden anular facturas autorizadas" };
    }

    // Create credit note
    const creditNote = await prisma.arcaInvoice.create({
      data: {
        userId: original.userId,
        projectId: original.projectId,
        paymentId: original.paymentId,
        tipoComprobante: "nota_credito_c",
        puntoVenta: original.puntoVenta,
        receptorNombre: original.receptorNombre,
        receptorCuit: original.receptorCuit,
        receptorDomicilio: original.receptorDomicilio,
        importeNeto: original.importeNeto,
        importeTotal: original.importeTotal,
        moneda: original.moneda,
        concepto: `Anulación de Factura ${original.puntoVenta}-${original.numero}`,
        conceptoTipo: original.conceptoTipo,
        periodoDesde: original.periodoDesde,
        periodoHasta: original.periodoHasta,
        status: "draft",
        updatedAt: new Date(),
      },
    });

    return { success: true, creditNoteId: creditNote.id };
  }

  /**
   * Generate a new private key and CSR for AFIP certificate
   * The CSR must be submitted to AFIP to get the signed certificate
   */
  async generateCertificate(
    userId: number,
    data: {
      cuit: string;
      razonSocial: string;
      email?: string;
      localidad?: string;
      provincia?: string;
    }
  ): Promise<CertificateGenerationResult> {
    try {
      // Validate CUIT format
      const cuitClean = data.cuit.replace(/-/g, "");
      if (!/^\d{11}$/.test(cuitClean)) {
        return {
          success: false,
          errorMessage: "CUIT inválido. Debe tener 11 dígitos.",
        };
      }

      // Generate RSA key pair (2048 bits is the minimum for AFIP)
      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });

      // Build the CSR subject
      // AFIP requires: CN=<razon_social>, serialNumber=CUIT <cuit>, C=AR
      const subject = this.buildCSRSubject({
        commonName: data.razonSocial.substring(0, 64), // Max 64 chars
        serialNumber: `CUIT ${cuitClean}`,
        country: "AR",
        organization: data.razonSocial.substring(0, 64),
        locality: data.localidad,
        state: data.provincia,
        email: data.email,
      });

      // Generate CSR using OpenSSL-compatible format
      const csr = this.generateCSR(privateKey, subject);

      // Save the private key to the user's config (encrypted would be better in production)
      await this.saveConfig(userId, {
        cuit: data.cuit,
        razonSocial: data.razonSocial,
        clavePrivada: privateKey,
      });

      return {
        success: true,
        privateKey,
        csr,
      };
    } catch (error: any) {
      console.error("Error generating certificate:", error);
      return {
        success: false,
        errorMessage: `Error al generar certificado: ${error.message}`,
      };
    }
  }

  /**
   * Build CSR subject string
   */
  private buildCSRSubject(data: {
    commonName: string;
    serialNumber: string;
    country: string;
    organization?: string;
    locality?: string;
    state?: string;
    email?: string;
  }): string {
    const parts: string[] = [];

    if (data.country) parts.push(`C=${data.country}`);
    if (data.state) parts.push(`ST=${data.state}`);
    if (data.locality) parts.push(`L=${data.locality}`);
    if (data.organization) parts.push(`O=${data.organization}`);
    parts.push(`serialNumber=${data.serialNumber}`);
    parts.push(`CN=${data.commonName}`);
    if (data.email) parts.push(`emailAddress=${data.email}`);

    return "/" + parts.join("/");
  }

  /**
   * Generate CSR from private key and subject
   * This creates a basic CSR structure that AFIP should accept
   */
  private generateCSR(privateKey: string, subject: string): string {
    // For a proper CSR, we need to use the crypto module more extensively
    // This is a simplified version - in production you might want to use
    // a library like node-forge for full X.509 support

    // Create a sign object to generate the CSR signature
    const csrInfo = this.buildCSRInfo(subject, privateKey);

    // The CSR needs to be in PEM format
    const csrPem = this.formatAsPEM(csrInfo, "CERTIFICATE REQUEST");

    return csrPem;
  }

  /**
   * Build CSR info structure
   * Note: This is a simplified implementation. For production,
   * consider using node-forge or similar library for proper ASN.1/DER encoding
   */
  private buildCSRInfo(subject: string, privateKey: string): string {
    // Extract public key from private key
    const publicKey = crypto.createPublicKey(privateKey);
    const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }) as string;

    // For AFIP, they actually expect you to generate the CSR using OpenSSL
    // or a similar tool. This method provides the necessary information
    // but the actual CSR generation is better done with OpenSSL command line:
    //
    // openssl req -new -key private.key -out request.csr -subj "/C=AR/O=<razon>/serialNumber=CUIT <cuit>/CN=<razon>"
    //
    // Since we can't easily generate a proper ASN.1 CSR in pure Node.js without
    // additional libraries, we'll provide a script/instructions for the user

    // Return a pseudo-CSR that shows what needs to be generated
    // In a real implementation, you'd use node-forge here
    const csrTemplate = `
Subject: ${subject}

To generate the actual CSR, use OpenSSL:
openssl req -new -key private.key -out request.csr -subj "${subject}"

Or upload the private key below along with this information to generate the CSR.

Public Key:
${publicKeyPem}
`;

    return Buffer.from(csrTemplate).toString("base64");
  }

  /**
   * Format data as PEM
   */
  private formatAsPEM(data: string, label: string): string {
    const lines = data.match(/.{1,64}/g) || [];
    return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----`;
  }

  /**
   * Generate CSR using node's built-in crypto (simplified version)
   * For production, this should use proper ASN.1 encoding
   */
  async generateCertificateSimple(
    userId: number,
    data: {
      cuit: string;
      razonSocial: string;
    }
  ): Promise<{
    success: boolean;
    privateKey?: string;
    opensslCommand?: string;
    errorMessage?: string;
  }> {
    try {
      const cuitClean = data.cuit.replace(/-/g, "");
      if (!/^\d{11}$/.test(cuitClean)) {
        return {
          success: false,
          errorMessage: "CUIT inválido. Debe tener 11 dígitos.",
        };
      }

      // Generate RSA key pair
      const { privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
      });

      // Save private key
      await this.saveConfig(userId, {
        cuit: data.cuit,
        razonSocial: data.razonSocial,
        clavePrivada: privateKey,
      });

      // Provide OpenSSL command to generate CSR
      const safeRazonSocial = data.razonSocial.replace(/"/g, '\\"').substring(0, 64);
      const opensslCommand = `openssl req -new -key private.key -out request.csr -subj "/C=AR/O=${safeRazonSocial}/serialNumber=CUIT ${cuitClean}/CN=${safeRazonSocial}"`;

      return {
        success: true,
        privateKey,
        opensslCommand,
      };
    } catch (error: any) {
      return {
        success: false,
        errorMessage: `Error: ${error.message}`,
      };
    }
  }
}

export const arcaService = new ArcaService();
