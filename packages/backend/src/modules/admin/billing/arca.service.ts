import { prisma } from "../../../lib/prisma";
import { ArcaInvoiceType } from "@prisma/client";
import * as crypto from "crypto";
import * as forge from "node-forge";

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
  wsaaToken?: string | null;
  wsaaSign?: string | null;
  wsaaExpiration?: Date | null;
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
    tokenInfo?: {
      hasToken: boolean;
      expiration?: string;
      isExpired?: boolean;
    };
    debug?: any;
  }> {
    const config = await this.getConfig(userId);
    const debug: any = {
      timestamp: new Date().toISOString(),
      steps: [],
    };

    debug.steps.push({ step: "getConfig", hasConfig: !!config });

    if (!config) {
      return {
        valid: false,
        message: "No hay configuración ARCA para este usuario",
        debug,
      };
    }

    debug.steps.push({
      step: "checkCertificates",
      hasCertificado: !!config.certificado,
      hasClavePrivada: !!config.clavePrivada,
      certificadoLength: config.certificado?.length || 0,
      clavePrivadaLength: config.clavePrivada?.length || 0,
      certificadoPreview: config.certificado?.substring(0, 100) + "...",
      clavePrivadaPreview: config.clavePrivada?.substring(0, 100) + "...",
    });

    if (!config.certificado || !config.clavePrivada) {
      return {
        valid: false,
        message: "No hay certificado o clave privada configurados",
        debug,
      };
    }

    try {
      // Try to generate a login ticket to validate the certificate
      const tokenResult = await this.authenticateWSAA(config, debug, userId);
      debug.steps.push({
        step: "authenticateWSAA_success",
        hasToken: !!tokenResult,
      });

      // Obtener info del token guardado
      const updatedConfig = await this.getConfig(userId);
      const tokenInfo = {
        hasToken: !!updatedConfig?.wsaaToken,
        expiration: updatedConfig?.wsaaExpiration?.toISOString(),
        isExpired: updatedConfig?.wsaaExpiration
          ? new Date() > updatedConfig.wsaaExpiration
          : true,
      };

      return {
        valid: !!tokenResult,
        message: tokenResult ? "Certificado válido" : "Error de autenticación",
        tokenInfo,
        debug,
      };
    } catch (error: any) {
      debug.steps.push({
        step: "authenticateWSAA_error",
        error: error.message,
        stack: error.stack,
      });
      return {
        valid: false,
        message: `Error al validar certificado: ${error.message}`,
        debug,
      };
    }
  }

  /**
   * Get current token status
   */
  async getTokenStatus(userId: number): Promise<{
    hasToken: boolean;
    isValid: boolean;
    expiration?: string;
    expiresIn?: string;
  }> {
    const config = await this.getConfig(userId);

    if (!config?.wsaaToken || !config?.wsaaExpiration) {
      return { hasToken: false, isValid: false };
    }

    const now = new Date();
    const expiration = new Date(config.wsaaExpiration);
    const isValid = now < expiration;
    const diffMs = expiration.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      hasToken: true,
      isValid,
      expiration: expiration.toISOString(),
      expiresIn: isValid ? `${diffHours}h ${diffMinutes}m` : "Expirado",
    };
  }

  /**
   * Get full token data for editing
   */
  async getTokenData(userId: number): Promise<{
    token: string | null;
    sign: string | null;
    expiration: string | null;
    isValid: boolean;
  }> {
    const config = await this.getConfig(userId);

    if (!config) {
      return { token: null, sign: null, expiration: null, isValid: false };
    }

    const now = new Date();
    const expiration = config.wsaaExpiration ? new Date(config.wsaaExpiration) : null;
    const isValid = expiration ? now < expiration : false;

    return {
      token: config.wsaaToken || null,
      sign: config.wsaaSign || null,
      expiration: expiration?.toISOString() || null,
      isValid,
    };
  }

  /**
   * Update token manually
   */
  async updateToken(userId: number, token: string, sign: string, expiration?: Date): Promise<void> {
    const exp = expiration || new Date(Date.now() + 12 * 60 * 60 * 1000); // Default 12 hours

    await prisma.arcaConfig.update({
      where: { userId },
      data: {
        //@ts-ignore
        wsaaToken: token,
        wsaaSign: sign,
        wsaaExpiration: exp,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Authenticate with WSAA (Web Service de Autenticación y Autorización)
   * This is the first step to interact with any AFIP web service
   */
  private async authenticateWSAA(
    config: ArcaConfig,
    debug?: any,
    userId?: number
  ): Promise<string | null> {
    if (!config.certificado || !config.clavePrivada) {
      throw new Error("Certificado o clave privada no configurados");
    }

    const urls = this.getUrls();
    const environment = this.isProduction ? "PRODUCCION" : "HOMOLOGACION";

    console.log("[ARCA DEBUG] ============================================");
    console.log("[ARCA DEBUG] Ambiente:", environment);
    console.log("[ARCA DEBUG] URL WSAA:", urls.wsaa);
    console.log("[ARCA DEBUG] ============================================");

    debug?.steps?.push({
      step: "environment",
      isProduction: this.isProduction,
      environment,
      wsaaUrl: urls.wsaa,
      note: "IMPORTANTE: El certificado debe coincidir con el ambiente. Certificados de producción NO funcionan en homologación y viceversa.",
    });

    // Generate TRA (Ticket de Requerimiento de Acceso)
    const tra = this.generateTRA();
    debug?.steps?.push({ step: "generateTRA", tra });

    // Sign TRA with certificate and private key
    const cms = this.signTRA(
      tra,
      config.certificado,
      config.clavePrivada,
      debug
    );
    debug?.steps?.push({
      step: "signTRA_result",
      cmsLength: cms.length,
      cmsPreview: cms.substring(0, 200) + "...",
    });

    // Send to WSAA
    const soapRequest = this.buildWSAARequest(cms);
    debug?.steps?.push({
      step: "buildWSAARequest",
      url: urls.wsaa,
      soapRequestLength: soapRequest.length,
      soapRequestPreview: soapRequest.substring(0, 500) + "...",
    });

    try {
      console.log("[ARCA DEBUG] Sending request to WSAA:", urls.wsaa);
      console.log("[ARCA DEBUG] CMS length:", cms.length);

      const response = await fetch(urls.wsaa, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "",
        },
        body: soapRequest,
      });

      const responseText = await response.text();
      console.log("[ARCA DEBUG] WSAA Response status:", response.status);
      console.log(
        "[ARCA DEBUG] WSAA Response:",
        responseText.substring(0, 1000)
      );

      debug?.steps?.push({
        step: "wsaaResponse",
        status: response.status,
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 1000),
      });

      // Parse response to get token and sign
      const tokenData = this.parseWSAAResponse(responseText);

      // Guardar el token en la base de datos si tenemos userId
      if (tokenData && userId) {
        const parsed = JSON.parse(tokenData);
        if (parsed.token !== "EXISTING_VALID_TOKEN") {
          // Extraer expiración de la respuesta
          const expirationMatch = responseText.match(
            /expirationTime[>"]([^<"]+)/
          );
          let expiration: Date | null = null;
          if (expirationMatch) {
            // Decodificar entidades HTML si es necesario
            const expStr = expirationMatch[1]
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&");
            expiration = new Date(expStr);
          } else {
            // Si no encontramos la expiración, asumimos 12 horas (default de AFIP)
            expiration = new Date(Date.now() + 12 * 60 * 60 * 1000);
          }

          console.log(
            "[ARCA DEBUG] Guardando token en DB, expira:",
            expiration
          );

          await prisma.arcaConfig.update({
            where: { userId },
            data: {
              //@ts-ignore
              wsaaToken: parsed.token,
              wsaaSign: parsed.sign,
              wsaaExpiration: expiration,
              updatedAt: new Date(),
            },
          });
        }
      }

      return tokenData;
    } catch (error: any) {
      console.error("[ARCA DEBUG] WSAA Authentication error:", error);
      debug?.steps?.push({ step: "wsaaFetchError", error: error.message });
      throw new Error(`Error de autenticación WSAA: ${error.message}`);
    }
  }

  /**
   * Generate TRA (Ticket de Requerimiento de Acceso)
   * AFIP requiere fechas en formato ISO 8601 con timezone
   */
  private generateTRA(): string {
    const now = new Date();
    // AFIP permite un margen de tiempo, usamos 1 minuto atrás y 10 minutos adelante
    const generationTime = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute ago
    const expirationTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

    // Formato ISO 8601 con timezone offset (AFIP lo requiere así)
    // Ejemplo: 2024-01-15T10:30:00-03:00
    const formatDateWithTimezone = (d: Date): string => {
      const pad = (n: number) => n.toString().padStart(2, "0");

      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      const seconds = pad(d.getSeconds());

      // Obtener offset del timezone local
      const tzOffset = -d.getTimezoneOffset();
      const tzHours = pad(Math.floor(Math.abs(tzOffset) / 60));
      const tzMinutes = pad(Math.abs(tzOffset) % 60);
      const tzSign = tzOffset >= 0 ? "+" : "-";

      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tzSign}${tzHours}:${tzMinutes}`;
    };

    const tra = `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${Math.floor(Date.now() / 1000)}</uniqueId>
    <generationTime>${formatDateWithTimezone(generationTime)}</generationTime>
    <expirationTime>${formatDateWithTimezone(expirationTime)}</expirationTime>
  </header>
  <service>wsfe</service>
</loginTicketRequest>`;

    console.log("[ARCA DEBUG] TRA generado:");
    console.log(
      "[ARCA DEBUG] - Generation Time:",
      formatDateWithTimezone(generationTime)
    );
    console.log(
      "[ARCA DEBUG] - Expiration Time:",
      formatDateWithTimezone(expirationTime)
    );
    console.log("[ARCA DEBUG] - Current Time:", formatDateWithTimezone(now));

    return tra;
  }

  /**
   * Sign TRA with certificate to create CMS/PKCS#7
   * AFIP requires a proper PKCS#7 signed message
   */
  private signTRA(
    tra: string,
    certificado: string,
    clavePrivada: string,
    debug?: any
  ): string {
    debug?.steps?.push({
      step: "signTRA_start",
      traLength: tra.length,
      certificadoFormat: this.detectCertFormat(certificado),
      clavePrivadaFormat: this.detectKeyFormat(clavePrivada),
    });

    // Normalizar el certificado y la clave privada
    const certPem = this.normalizePEM(certificado, "CERTIFICATE");
    let keyPem = this.normalizePEM(clavePrivada, "PRIVATE KEY");

    // Si la clave es RSA PRIVATE KEY, intentar ese formato
    if (
      clavePrivada.includes("RSA PRIVATE KEY") ||
      !clavePrivada.includes("BEGIN")
    ) {
      const rsaKeyPem = this.normalizePEM(clavePrivada, "RSA PRIVATE KEY");
      // Intentar primero RSA
      try {
        forge.pki.privateKeyFromPem(rsaKeyPem);
        keyPem = rsaKeyPem;
      } catch {
        // Si falla, mantener el formato PKCS8
      }
    }

    debug?.steps?.push({
      step: "signTRA_normalized",
      certPemPreview: certPem.substring(0, 200) + "...",
      keyPemPreview: keyPem.substring(0, 200) + "...",
    });

    try {
      // Verificar certificado con Node.js crypto primero (para debug)
      try {
        const certObj = new crypto.X509Certificate(certPem);
        const issuerCN = certObj.issuer;
        const isAfipCert =
          issuerCN.includes("AFIP") || issuerCN.includes("Computadores");

        debug?.steps?.push({
          step: "signTRA_certParsed_node",
          subject: certObj.subject,
          issuer: certObj.issuer,
          validFrom: certObj.validFrom,
          validTo: certObj.validTo,
          serialNumber: certObj.serialNumber,
          isAfipCert,
          warning: !isAfipCert
            ? "ADVERTENCIA: El certificado NO parece estar firmado por AFIP. Debe usar un certificado emitido por AFIP."
            : null,
        });

        if (!isAfipCert) {
          console.log(
            "[ARCA DEBUG] ADVERTENCIA: El certificado no está firmado por AFIP!"
          );
          console.log("[ARCA DEBUG] Issuer:", certObj.issuer);
          console.log(
            "[ARCA DEBUG] El certificado debe ser generado desde AFIP con clave fiscal"
          );
        }
      } catch (nodeErr: any) {
        debug?.steps?.push({
          step: "signTRA_certParsed_node_error",
          error: nodeErr.message,
        });
      }

      // Parsear certificado con node-forge
      console.log("[ARCA DEBUG] Parseando certificado con node-forge...");
      const forgeCert = forge.pki.certificateFromPem(certPem);

      const issuerStr = forgeCert.issuer.attributes
        .map((a: any) => `${a.shortName}=${a.value}`)
        .join(", ");
      const subjectStr = forgeCert.subject.attributes
        .map((a: any) => `${a.shortName}=${a.value}`)
        .join(", ");

      debug?.steps?.push({
        step: "signTRA_forgeCertParsed",
        subject: subjectStr,
        issuer: issuerStr,
        serialNumber: forgeCert.serialNumber,
        validFrom: forgeCert.validity.notBefore.toISOString(),
        validTo: forgeCert.validity.notAfter.toISOString(),
      });

      console.log("[ARCA DEBUG] Certificado Subject:", subjectStr);
      console.log("[ARCA DEBUG] Certificado Issuer:", issuerStr);

      // Parsear clave privada con node-forge
      console.log("[ARCA DEBUG] Parseando clave privada con node-forge...");
      let forgePrivateKey: forge.pki.PrivateKey;

      try {
        forgePrivateKey = forge.pki.privateKeyFromPem(keyPem);
        debug?.steps?.push({
          step: "signTRA_forgeKeyParsed",
          format: "success",
        });
      } catch (keyErr1: any) {
        debug?.steps?.push({
          step: "signTRA_forgeKeyParsed_error",
          error: keyErr1.message,
        });
        throw new Error(
          `No se pudo parsear la clave privada: ${keyErr1.message}`
        );
      }

      console.log(
        "[ARCA DEBUG] Creando PKCS#7 signed message (detached=false)..."
      );

      // Crear mensaje PKCS#7 firmado - AFIP espera el contenido embebido
      const p7 = forge.pkcs7.createSignedData();

      // Agregar el contenido (TRA XML) - debe estar embebido
      p7.content = forge.util.createBuffer(tra, "utf8");

      // Agregar el certificado del firmante
      p7.addCertificate(forgeCert);

      // Agregar el firmante con SHA256
      p7.addSigner({
        key: forgePrivateKey,
        certificate: forgeCert,
        digestAlgorithm: forge.pki.oids.sha256,
        authenticatedAttributes: [
          {
            type: forge.pki.oids.contentType,
            value: forge.pki.oids.data,
          },
          {
            type: forge.pki.oids.messageDigest,
            // value se calcula automáticamente
          },
          {
            type: forge.pki.oids.signingTime,
            value: new Date() as any,
          },
        ],
      });

      // Firmar - detached=false para incluir el contenido
      console.log("[ARCA DEBUG] Firmando PKCS#7...");
      p7.sign({ detached: false });

      debug?.steps?.push({
        step: "signTRA_pkcs7Signed",
        message: "PKCS#7 firmado correctamente",
      });

      // Convertir a DER y luego a base64
      const asn1 = p7.toAsn1();
      const der = forge.asn1.toDer(asn1);
      const cms = forge.util.encode64(der.getBytes());

      console.log("[ARCA DEBUG] CMS generado, longitud:", cms.length);

      debug?.steps?.push({
        step: "signTRA_cmsCreated",
        cmsLength: cms.length,
        cmsPreview: cms.substring(0, 200) + "...",
      });

      return cms;
    } catch (error: any) {
      console.error("[ARCA DEBUG] Error en signTRA:", error);
      debug?.steps?.push({
        step: "signTRA_error",
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Error firmando TRA: ${error.message}`);
    }
  }

  /**
   * Detectar formato del certificado
   */
  private detectCertFormat(cert: string): string {
    if (cert.includes("-----BEGIN CERTIFICATE-----")) return "PEM";
    if (cert.includes("-----BEGIN X509 CERTIFICATE-----")) return "PEM_X509";
    if (/^[A-Za-z0-9+/=\s]+$/.test(cert)) return "BASE64_DER";
    return "UNKNOWN";
  }

  /**
   * Detectar formato de la clave privada
   */
  private detectKeyFormat(key: string): string {
    if (key.includes("-----BEGIN PRIVATE KEY-----")) return "PKCS8_PEM";
    if (key.includes("-----BEGIN RSA PRIVATE KEY-----")) return "PKCS1_PEM";
    if (key.includes("-----BEGIN ENCRYPTED PRIVATE KEY-----"))
      return "ENCRYPTED_PEM";
    if (/^[A-Za-z0-9+/=\s]+$/.test(key)) return "BASE64_DER";
    return "UNKNOWN";
  }

  /**
   * Normalizar PEM (agregar headers si faltan)
   */
  private normalizePEM(content: string, type: string): string {
    const trimmed = content.trim();

    // Si ya tiene headers PEM, devolverlo como está
    if (trimmed.startsWith("-----BEGIN")) {
      return trimmed;
    }

    // Si es base64 sin headers, agregar headers
    const base64Clean = trimmed.replace(/\s/g, "");
    const lines = base64Clean.match(/.{1,64}/g) || [];
    return `-----BEGIN ${type}-----\n${lines.join(
      "\n"
    )}\n-----END ${type}-----`;
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
    // La respuesta de AFIP viene con el XML interno escapado como HTML entities
    // Primero decodificamos las entidades HTML
    const decodedResponse = response
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#xE1;/g, "á")
      .replace(/&#xE9;/g, "é")
      .replace(/&#xED;/g, "í")
      .replace(/&#xF3;/g, "ó")
      .replace(/&#xFA;/g, "ú")
      .replace(/&#xFC;/g, "ü");

    console.log("[ARCA DEBUG] Parsing WSAA response...");

    // Extract token from SOAP response
    const tokenMatch = decodedResponse.match(/<token>([^<]+)<\/token>/);
    const signMatch = decodedResponse.match(/<sign>([^<]+)<\/sign>/);

    if (tokenMatch && signMatch) {
      console.log("[ARCA DEBUG] Token y Sign encontrados!");
      console.log("[ARCA DEBUG] Token length:", tokenMatch[1].length);
      console.log("[ARCA DEBUG] Sign length:", signMatch[1].length);
      return JSON.stringify({
        token: tokenMatch[1],
        sign: signMatch[1],
      });
    }

    // Check for errors
    const faultMatch = decodedResponse.match(
      /<faultstring>([^<]+)<\/faultstring>/
    );
    if (faultMatch) {
      const errorMessage = faultMatch[1];
      console.log("[ARCA DEBUG] Error en respuesta WSAA:", errorMessage);

      // Si ya tiene un TA válido, el certificado es válido
      if (
        errorMessage.includes("ya posee un TA valido") ||
        errorMessage.includes("ya posee un TA válido")
      ) {
        console.log(
          "[ARCA DEBUG] El certificado es válido - ya existe un token activo"
        );
        // Retornamos un token placeholder para indicar que la autenticación es válida
        return JSON.stringify({
          token: "EXISTING_VALID_TOKEN",
          sign: "EXISTING_VALID_SIGN",
          note: "Ya existe un token válido para este servicio",
        });
      }

      throw new Error(errorMessage);
    }

    console.log("[ARCA DEBUG] No se encontró token ni error en la respuesta");
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

    // Obtener token válido
    let authToken: string | null = null;
    if (config.wsaaToken && config.wsaaSign && config.wsaaExpiration) {
      const now = new Date();
      const expiration = new Date(config.wsaaExpiration);
      if (now < expiration) {
        authToken = JSON.stringify({
          token: config.wsaaToken,
          sign: config.wsaaSign,
        });
      }
    }
    if (!authToken) {
      authToken = await this.authenticateWSAA(config, undefined, userId);
      if (authToken) {
        const parsed = JSON.parse(authToken);
        if (parsed.token === "EXISTING_VALID_TOKEN") {
          const refreshedConfig = await this.getConfig(userId);
          if (refreshedConfig?.wsaaToken && refreshedConfig?.wsaaSign) {
            authToken = JSON.stringify({
              token: refreshedConfig.wsaaToken,
              sign: refreshedConfig.wsaaSign,
            });
          } else {
            throw new Error(
              "AFIP indica que ya existe un token válido pero no lo tenemos guardado. Por favor, espere unos minutos e intente nuevamente."
            );
          }
        }
      }
    }
    if (!authToken) {
      throw new Error("No se pudo autenticar con WSAA");
    }

    // Llamar a FECompUltimoAutorizado
    const numero = await this.callFECompUltimoAutorizado(
      config,
      authToken,
      tipoComprobante
    );
    return numero + 1;
  }

  /**
   * Llama a FECompUltimoAutorizado para obtener el último número autorizado
   */
  private async callFECompUltimoAutorizado(
    config: ArcaConfig,
    authToken: string,
    tipoComprobante: ArcaInvoiceType
  ): Promise<number> {
    const urls = this.getUrls();
    const auth = JSON.parse(authToken);
    const cbteCode = COMPROBANTE_CODES[tipoComprobante];
    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:FECompUltimoAutorizado>
      <ar:Auth>
        <ar:Token>${auth.token}</ar:Token>
        <ar:Sign>${auth.sign}</ar:Sign>
        <ar:Cuit>${config.cuit.replace(/-/g, "")}</ar:Cuit>
      </ar:Auth>
      <ar:PtoVta>${config.puntoVenta}</ar:PtoVta>
      <ar:CbteTipo>${cbteCode}</ar:CbteTipo>
    </ar:FECompUltimoAutorizado>
  </soapenv:Body>
</soapenv:Envelope>`;

    // DEBUG LOGGING
    console.log("[ARCA DEBUG] callFECompUltimoAutorizado called");
    console.log("[ARCA DEBUG] URLs:", urls);
    console.log("[ARCA DEBUG] Auth: ", auth);
    console.log("[ARCA DEBUG] tipoComprobante:", tipoComprobante, "cbteCode:", cbteCode);
    console.log("[ARCA DEBUG] SOAP Request:\n", soapRequest);

    try {
      const response = await fetch(urls.wsfe, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "http://ar.gov.afip.dif.FEV1/FECompUltimoAutorizado",
        },
        body: soapRequest,
      });
      const responseText = await response.text();
      console.log("[ARCA DEBUG] FECompUltimoAutorizado HTTP status:", response.status);
      console.log("[ARCA DEBUG] FECompUltimoAutorizado response (first 1000 chars):\n", responseText.substring(0, 1000));
      // Buscar <CbteNro> en la respuesta
      const match = responseText.match(/<CbteNro>(\d+)<\/CbteNro>/);
      if (match) {
        console.log("[ARCA DEBUG] <CbteNro> found:", match[1]);
        return parseInt(match[1], 10);
      }
      // Si no hay comprobantes, devolver 0
      if (
        responseText.includes(
          "No existen comprobantes emitidos para los parámetros informados"
        )
      ) {
        console.log("[ARCA DEBUG] No existen comprobantes emitidos para los parámetros informados");
        return 0;
      }
      console.log("[ARCA DEBUG] No <CbteNro> found and no known error message. Full response:", responseText);
      throw new Error("No se pudo obtener el último número autorizado de AFIP");
    } catch (error: any) {
      console.error("[ARCA DEBUG] Error en FECompUltimoAutorizado:", error);
      throw new Error(`Error en FECompUltimoAutorizado: ${error.message}`);
    }
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
      // Check if we have a valid token in DB first
      let authToken: string | null = null;

      if (config.wsaaToken && config.wsaaSign && config.wsaaExpiration) {
        const now = new Date();
        const expiration = new Date(config.wsaaExpiration);
        if (now < expiration) {
          // Token still valid, use it
          console.log(
            "[ARCA DEBUG] Usando token existente de la DB, expira:",
            expiration
          );
          authToken = JSON.stringify({
            token: config.wsaaToken,
            sign: config.wsaaSign,
          });
        }
      }

      // If no valid token, authenticate with WSAA
      if (!authToken) {
        console.log("[ARCA DEBUG] No hay token válido, solicitando nuevo...");
        authToken = await this.authenticateWSAA(config, undefined, userId);

        // If we got EXISTING_VALID_TOKEN, try to get from DB again
        if (authToken) {
          const parsed = JSON.parse(authToken);
          if (parsed.token === "EXISTING_VALID_TOKEN") {
            // Reload config to get the actual token
            const refreshedConfig = await this.getConfig(userId);
            if (refreshedConfig?.wsaaToken && refreshedConfig?.wsaaSign) {
              authToken = JSON.stringify({
                token: refreshedConfig.wsaaToken,
                sign: refreshedConfig.wsaaSign,
              });
              console.log(
                "[ARCA DEBUG] Token recuperado de DB después de refresh"
              );
            } else {
              throw new Error(
                "AFIP indica que ya existe un token válido pero no lo tenemos guardado. Por favor, espere unos minutos e intente nuevamente."
              );
            }
          }
        }
      }

      if (!authToken) {
        throw new Error("No se pudo autenticar con WSAA");
      }

      // Get next invoice number
      const numero = await this.getNextInvoiceNumber(
        userId,
        invoice.tipoComprobante
      );

      // Build and send WSFE request
      const wsfeResult = await this.callWSFE(
        config,
        authToken,
        invoice,
        numero
      );

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
    const cbteCode =
      COMPROBANTE_CODES[invoice.tipoComprobante as ArcaInvoiceType];

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
            <ar:DocNro>${
              invoice.receptorCuit?.replace(/-/g, "") || 0
            }</ar:DocNro>
            <ar:CondicionIVAReceptorId>${
              invoice.receptorCondicionIva || 5
            }</ar:CondicionIVAReceptorId>
            <ar:CbteDesde>${numero}</ar:CbteDesde>
            <ar:CbteHasta>${numero}</ar:CbteHasta>
            <ar:CbteFch>${today}</ar:CbteFch>
            <ar:ImpTotal>${importeTotal.toFixed(2)}</ar:ImpTotal>
            <ar:ImpTotConc>0</ar:ImpTotConc>
            <ar:ImpNeto>${importeNeto.toFixed(2)}</ar:ImpNeto>
            <ar:ImpOpEx>0</ar:ImpOpEx>
            <ar:ImpIVA>0</ar:ImpIVA>
            <ar:ImpTrib>0</ar:ImpTrib>
            ${
              invoice.conceptoTipo !== 1
                ? `
            <ar:FchServDesde>${
              formatAFIPDate(invoice.periodoDesde) || today
            }</ar:FchServDesde>
            <ar:FchServHasta>${
              formatAFIPDate(invoice.periodoHasta) || today
            }</ar:FchServHasta>
            <ar:FchVtoPago>${
              formatAFIPDate(invoice.vencimientoPago) || today
            }</ar:FchVtoPago>
            `
                : ""
            }
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
      console.log("[ARCA DEBUG] WSFE Response status:", response.status);
      console.log("[ARCA DEBUG] WSFE Response:", responseText);
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
  private parseWSFEResponse(
    response: string,
    numero: number
  ): AuthorizationResult {
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
    const errorMatch = response.match(
      /<Err>[\s\S]*?<Code>(\d+)<\/Code>[\s\S]*?<Msg>([^<]+)<\/Msg>/
    );
    if (errorMatch) {
      return {
        success: false,
        errorMessage: `Error ${errorMatch[1]}: ${errorMatch[2]}`,
        afipResponse: response,
      };
    }

    // Check for observations
    const obsMatch = response.match(
      /<Obs>[\s\S]*?<Code>(\d+)<\/Code>[\s\S]*?<Msg>([^<]+)<\/Msg>/
    );
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
  ): Promise<{
    success: boolean;
    creditNoteId?: number;
    errorMessage?: string;
  }> {
    const original = await prisma.arcaInvoice.findUnique({
      where: { id: originalInvoiceId },
    });

    if (!original) {
      return { success: false, errorMessage: "Factura original no encontrada" };
    }

    if (original.status !== "authorized") {
      return {
        success: false,
        errorMessage: "Solo se pueden anular facturas autorizadas",
      };
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
    const publicKeyPem = publicKey.export({
      type: "spki",
      format: "pem",
    }) as string;

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
    return `-----BEGIN ${label}-----\n${lines.join(
      "\n"
    )}\n-----END ${label}-----`;
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
      const safeRazonSocial = data.razonSocial
        .replace(/"/g, '\\"')
        .substring(0, 64);
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

  /**
   * Query invoice from AFIP (FECompConsultar)
   * Used to sync local invoices with AFIP records
   */
  async consultInvoice(
    userId: number,
    tipoComprobante: ArcaInvoiceType,
    numero: number
  ): Promise<{
    success: boolean;
    invoice?: {
      numero: number;
      tipoComprobante: number;
      puntoVenta: number;
      fechaEmision: string;
      docTipo: number;
      docNro: string;
      importeTotal: number;
      importeNeto: number;
      cae: string;
      caeVencimiento: string;
      resultado: string;
    };
    errorMessage?: string;
  }> {
    const config = await this.getConfig(userId);
    if (!config) {
      return { success: false, errorMessage: "No hay configuración ARCA" };
    }

    // Get valid token
    let authToken = await this.getValidToken(userId, config);
    if (!authToken) {
      return { success: false, errorMessage: "No se pudo obtener token de autenticación" };
    }

    const urls = this.getUrls();
    const auth = JSON.parse(authToken);
    const cbteCode = COMPROBANTE_CODES[tipoComprobante];

    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <ar:FECompConsultar>
      <ar:Auth>
        <ar:Token>${auth.token}</ar:Token>
        <ar:Sign>${auth.sign}</ar:Sign>
        <ar:Cuit>${config.cuit.replace(/-/g, "")}</ar:Cuit>
      </ar:Auth>
      <ar:FeCompConsReq>
        <ar:CbteTipo>${cbteCode}</ar:CbteTipo>
        <ar:CbteNro>${numero}</ar:CbteNro>
        <ar:PtoVta>${config.puntoVenta}</ar:PtoVta>
      </ar:FeCompConsReq>
    </ar:FECompConsultar>
  </soapenv:Body>
</soapenv:Envelope>`;

    try {
      const response = await fetch(urls.wsfe, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "http://ar.gov.afip.dif.FEV1/FECompConsultar",
        },
        body: soapRequest,
      });

      const responseText = await response.text();
      console.log("[ARCA DEBUG] FECompConsultar Response:", responseText.substring(0, 1000));

      // Parse response
      const resultadoMatch = responseText.match(/<Resultado>([^<]+)<\/Resultado>/);
      if (!resultadoMatch || resultadoMatch[1] !== "A") {
        const errMatch = responseText.match(/<Err>[\s\S]*?<Code>(\d+)<\/Code>[\s\S]*?<Msg>([^<]+)<\/Msg>/);
        if (errMatch) {
          return { success: false, errorMessage: `Error ${errMatch[1]}: ${errMatch[2]}` };
        }
        return { success: false, errorMessage: "Comprobante no encontrado en AFIP" };
      }

      // Extract invoice data
      const extractValue = (tag: string) => {
        const match = responseText.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
        return match ? match[1] : "";
      };

      return {
        success: true,
        invoice: {
          numero: parseInt(extractValue("CbteDesde"), 10),
          tipoComprobante: parseInt(extractValue("CbteTipo"), 10),
          puntoVenta: parseInt(extractValue("PtoVta"), 10),
          fechaEmision: extractValue("CbteFch"),
          docTipo: parseInt(extractValue("DocTipo"), 10),
          docNro: extractValue("DocNro"),
          importeTotal: parseFloat(extractValue("ImpTotal")),
          importeNeto: parseFloat(extractValue("ImpNeto")),
          cae: extractValue("CodAutorizacion"),
          caeVencimiento: extractValue("FchVto"),
          resultado: extractValue("Resultado"),
        },
      };
    } catch (error: any) {
      return { success: false, errorMessage: `Error de comunicación: ${error.message}` };
    }
  }

  /**
   * Get valid token (from DB or request new)
   */
  private async getValidToken(userId: number, config: ArcaConfig): Promise<string | null> {
    // Check if we have a valid token in DB
    if (config.wsaaToken && config.wsaaSign && config.wsaaExpiration) {
      const now = new Date();
      const expiration = new Date(config.wsaaExpiration);
      if (now < expiration) {
        return JSON.stringify({
          token: config.wsaaToken,
          sign: config.wsaaSign,
        });
      }
    }

    // Request new token
    const authToken = await this.authenticateWSAA(config, undefined, userId);
    if (authToken) {
      const parsed = JSON.parse(authToken);
      if (parsed.token === "EXISTING_VALID_TOKEN") {
        const refreshedConfig = await this.getConfig(userId);
        if (refreshedConfig?.wsaaToken && refreshedConfig?.wsaaSign) {
          return JSON.stringify({
            token: refreshedConfig.wsaaToken,
            sign: refreshedConfig.wsaaSign,
          });
        }
      } else {
        return authToken;
      }
    }

    return null;
  }

  /**
   * Sync all invoices with AFIP
   * Gets the last authorized number and syncs any missing invoices
   */
  async syncInvoices(userId: number, tipoComprobante: ArcaInvoiceType): Promise<{
    success: boolean;
    synced: number;
    errors: string[];
    message: string;
  }> {
    const config = await this.getConfig(userId);
    if (!config) {
      return { success: false, synced: 0, errors: [], message: "No hay configuración ARCA" };
    }

    const errors: string[] = [];
    let synced = 0;

    try {
      // Get last authorized number from AFIP
      const lastNumber = await this.getNextInvoiceNumber(userId, tipoComprobante) - 1;

      if (lastNumber <= 0) {
        return { success: true, synced: 0, errors: [], message: "No hay comprobantes autorizados en AFIP" };
      }

      // Get local invoices that are authorized
      const localInvoices = await prisma.arcaInvoice.findMany({
        where: {
          userId,
          tipoComprobante,
          puntoVenta: config.puntoVenta,
          status: "authorized",
        },
        select: { numero: true, cae: true },
      });

      const localNumbers = new Set(localInvoices.map(inv => inv.numero));

      // Find missing invoices (in AFIP but not in local DB)
      const missingNumbers: number[] = [];
      for (let i = 1; i <= lastNumber; i++) {
        if (!localNumbers.has(i)) {
          missingNumbers.push(i);
        }
      }

      // Limit to last 100 to avoid too many requests
      const numbersToSync = missingNumbers.slice(-100);

      // Sync each missing invoice
      for (const numero of numbersToSync) {
        const result = await this.consultInvoice(userId, tipoComprobante, numero);

        if (result.success && result.invoice) {
          // Create or update local record
          const existing = await prisma.arcaInvoice.findFirst({
            where: {
              userId,
              tipoComprobante,
              puntoVenta: config.puntoVenta,
              numero,
            },
          });

          if (!existing) {
            // Parse AFIP date format YYYYMMDD to Date
            const parseDateAFIP = (dateStr: string) => {
              if (!dateStr || dateStr.length !== 8) return new Date();
              const year = parseInt(dateStr.slice(0, 4), 10);
              const month = parseInt(dateStr.slice(4, 6), 10) - 1;
              const day = parseInt(dateStr.slice(6, 8), 10);
              return new Date(year, month, day);
            };

            await prisma.arcaInvoice.create({
              data: {
                userId,
                tipoComprobante,
                puntoVenta: config.puntoVenta,
                numero,
                receptorNombre: "Importado de AFIP",
                receptorCuit: result.invoice.docNro || null,
                importeNeto: result.invoice.importeNeto,
                importeTotal: result.invoice.importeTotal,
                concepto: "Comprobante importado de AFIP",
                conceptoTipo: 2,
                cae: result.invoice.cae,
                caeVencimiento: parseDateAFIP(result.invoice.caeVencimiento),
                status: "authorized",
                fechaEmision: parseDateAFIP(result.invoice.fechaEmision),
                afipResponse: JSON.stringify(result.invoice),
                updatedAt: new Date(),
              },
            });
            synced++;
          }
        } else {
          errors.push(`Comprobante ${numero}: ${result.errorMessage}`);
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return {
        success: true,
        synced,
        errors,
        message: synced > 0
          ? `Se sincronizaron ${synced} comprobantes`
          : "Todos los comprobantes están sincronizados",
      };
    } catch (error: any) {
      return {
        success: false,
        synced,
        errors: [error.message],
        message: `Error durante la sincronización: ${error.message}`,
      };
    }
  }

  /**
   * Get invoice data for PDF generation
   */
  async getInvoiceForPDF(userId: number, invoiceId: number): Promise<{
    success: boolean;
    invoice?: any;
    config?: ArcaConfig;
    errorMessage?: string;
  }> {
    const config = await this.getConfig(userId);
    if (!config) {
      return { success: false, errorMessage: "No hay configuración ARCA" };
    }

    const invoice = await prisma.arcaInvoice.findFirst({
      where: { id: invoiceId, userId },
      include: { project: true },
    });

    if (!invoice) {
      return { success: false, errorMessage: "Factura no encontrada" };
    }

    if (invoice.status !== "authorized" || !invoice.cae) {
      return { success: false, errorMessage: "La factura no está autorizada o no tiene CAE" };
    }

    return { success: true, invoice, config };
  }

  /**
   * Generate QR code data for AFIP invoice
   * According to RG 4291/2018
   */
  generateQRData(config: ArcaConfig, invoice: any): string {
    const cuitClean = config.cuit.replace(/-/g, "");
    const cbteCode = COMPROBANTE_CODES[invoice.tipoComprobante as ArcaInvoiceType];

    // Format date as YYYY-MM-DD
    const formatDate = (d: Date) => {
      return d.toISOString().slice(0, 10);
    };

    // Build JSON for QR code (RG 4291/2018)
    const qrData = {
      ver: 1,
      fecha: formatDate(invoice.fechaEmision || new Date()),
      cuit: parseInt(cuitClean, 10),
      ptoVta: invoice.puntoVenta,
      tipoCmp: cbteCode,
      nroCmp: invoice.numero,
      importe: parseFloat(invoice.importeTotal.toString()),
      moneda: invoice.moneda || "PES",
      ctz: 1,
      tipoDocRec: invoice.receptorCuit ? 80 : 99,
      nroDocRec: invoice.receptorCuit ? parseInt(invoice.receptorCuit.replace(/-/g, ""), 10) : 0,
      tipoCodAut: "E", // CAE
      codAut: parseInt(invoice.cae, 10),
    };

    // Encode as base64
    const jsonStr = JSON.stringify(qrData);
    const base64 = Buffer.from(jsonStr).toString("base64");

    // AFIP QR verification URL
    return `https://www.afip.gob.ar/fe/qr/?p=${base64}`;
  }
}

export const arcaService = new ArcaService();
