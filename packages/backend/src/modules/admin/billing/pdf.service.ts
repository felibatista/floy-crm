import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import puppeteer from "puppeteer";
import { ArcaInvoiceType } from "@prisma/client";
import { FacturaTemplate, FacturaData } from "./templates/FacturaTemplate";

// Mapeo de tipos de comprobante a texto legible
const TIPO_COMPROBANTE_TEXTO: Record<ArcaInvoiceType, string> = {
  factura_c: "FACTURA",
  nota_credito_c: "NOTA DE CRÉDITO",
  nota_debito_c: "NOTA DE DÉBITO",
};

const TIPO_COMPROBANTE_LETRA: Record<ArcaInvoiceType, string> = {
  factura_c: "C",
  nota_credito_c: "C",
  nota_debito_c: "C",
};

// Condiciones de IVA (códigos AFIP)
const CONDICION_IVA_TEXTO: Record<number, string> = {
  1: "IVA Responsable Inscripto",
  2: "IVA Responsable No Inscripto",
  3: "IVA No Responsable",
  4: "IVA Sujeto Exento",
  5: "Consumidor Final",
  6: "Responsable Monotributo",
  7: "Sujeto No Categorizado",
  8: "Proveedor del Exterior",
  9: "Cliente del Exterior",
  10: "IVA Liberado - Ley 19.640",
  11: "IVA Responsable Inscripto - Agente de Percepción",
  12: "Pequeño Contribuyente Eventual",
  13: "Monotributista Social",
  14: "Pequeño Contribuyente Eventual Social",
};

// Tailwind CSS (versión reducida con las clases usadas en el template)
const TAILWIND_CSS = `
/* Reset y base */
*, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: #e5e7eb; }
html { line-height: 1.5; -webkit-text-size-adjust: 100%; font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; }
body { margin: 0; line-height: inherit; }
img { display: block; max-width: 100%; height: auto; }

/* Flexbox */
.flex { display: flex; }
.flex-1 { flex: 1 1 0%; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }

/* Sizing */
.w-\\[45\\%\\] { width: 45%; }
.w-\\[10\\%\\] { width: 10%; }
.w-\\[80px\\] { width: 80px; }
.w-\\[100px\\] { width: 100px; }
.w-\\[120px\\] { width: 120px; }
.w-\\[150px\\] { width: 150px; }
.w-\\[180px\\] { width: 180px; }
.min-h-\\[200px\\] { min-height: 200px; }
.max-w-\\[800px\\] { max-width: 800px; }
.max-w-full { max-width: 100%; }
.max-h-full { max-height: 100%; }
.h-\\[100px\\] { height: 100px; }
.w-\\[100px\\] { width: 100px; }

/* Spacing */
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.pr-4 { padding-right: 1rem; }
.pt-2 { padding-top: 0.5rem; }
.pb-1 { padding-bottom: 0.25rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mr-5 { margin-right: 1.25rem; }
.mx-auto { margin-left: auto; margin-right: auto; }

/* Typography */
.font-sans { font-family: ui-sans-serif, system-ui, sans-serif; }
.font-bold { font-weight: 700; }
.text-\\[8px\\] { font-size: 8px; }
.text-\\[9px\\] { font-size: 9px; }
.text-\\[10px\\] { font-size: 10px; }
.text-\\[11px\\] { font-size: 11px; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.leading-none { line-height: 1; }
.leading-normal { line-height: 1.5; }

/* Colors */
.text-gray-400 { color: rgb(156 163 175); }
.text-gray-500 { color: rgb(107 114 128); }
.text-gray-800 { color: rgb(31 41 55); }
.bg-white { background-color: rgb(255 255 255); }
.bg-gray-50 { background-color: rgb(249 250 251); }
.bg-gray-100 { background-color: rgb(243 244 246); }

/* Borders */
.border { border-width: 1px; }
.border-2 { border-width: 2px; }
.border-t { border-top-width: 1px; }
.border-t-2 { border-top-width: 2px; }
.border-b { border-bottom-width: 1px; }
.border-b-2 { border-bottom-width: 2px; }
.border-r-2 { border-right-width: 2px; }
.border-black { border-color: rgb(0 0 0); }
.border-gray-100 { border-color: rgb(243 244 246); }
.border-gray-300 { border-color: rgb(209 213 219); }

/* Print */
@media print {
  body { padding: 0; }
  .border-2 { border-width: 1px; }
}
`;

export interface InvoiceData {
  // Datos del emisor
  razonSocial: string;
  domicilioFiscal: string;
  cuitEmisor: string;
  condicionIva: string;
  ingresosBrutos?: string;
  inicioActividades?: string;

  // Datos del comprobante
  tipoComprobante: ArcaInvoiceType;
  puntoVenta: number;
  numero: number;
  fechaEmision: Date;

  // Datos del receptor
  receptorNombre: string;
  receptorCuit?: string;
  receptorCondicionIva?: number;
  receptorDomicilio?: string;

  // Importes
  importeNeto: number;
  importeIva?: number;
  importeTotal: number;
  moneda: string;

  // Concepto
  concepto: string;
  conceptoTipo: number;
  periodoDesde?: Date;
  periodoHasta?: Date;
  vencimientoPago?: Date;

  // CAE
  cae: string;
  caeVencimiento: Date;

  // QR
  qrCodeUrl?: string;

  // Leyenda impositiva personalizada
  leyendaImpositiva?: string;
}

export class PdfService {
  /**
   * Formatea una fecha en formato argentino
   */
  private formatDate(date: Date | undefined | null): string {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  /**
   * Formatea un número como moneda
   */
  private formatCurrency(amount: number, moneda = "PES"): string {
    return amount.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /**
   * Formatea el número de punto de venta (4 dígitos)
   */
  private formatPuntoVenta(pv: number): string {
    return pv.toString().padStart(4, "0");
  }

  /**
   * Formatea el número de comprobante (8 dígitos)
   */
  private formatNumeroComprobante(num: number): string {
    return num.toString().padStart(8, "0");
  }

  /**
   * Formatea el CUIT con guiones
   */
  private formatCuit(cuit: string | undefined): string {
    if (!cuit) return "-";
    const clean = cuit.replace(/-/g, "");
    if (clean.length === 11) {
      return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10)}`;
    }
    return cuit;
  }

  /**
   * Obtiene la leyenda impositiva según la condición de IVA
   */
  private getLeyendaImpositiva(condicionIva: string): string {
    const condicion = condicionIva.toLowerCase();
    if (condicion.includes("monotributo")) {
      return "El importe de esta factura no incluye IVA por tratarse de un sujeto Monotributista.";
    }
    if (condicion.includes("exento")) {
      return "Operación exenta de IVA.";
    }
    return "Importe expresado en pesos argentinos.";
  }

  /**
   * Transforma InvoiceData a FacturaData para el template
   */
  private toFacturaData(data: InvoiceData): FacturaData {
    return {
      // Emisor
      razonSocial: data.razonSocial,
      domicilioFiscal: data.domicilioFiscal || "-",
      cuitEmisor: this.formatCuit(data.cuitEmisor),
      condicionIva: data.condicionIva,
      ingresosBrutos: data.ingresosBrutos || data.cuitEmisor,
      inicioActividades: data.inicioActividades,

      // Comprobante
      tipoComprobante: data.tipoComprobante,
      puntoVenta: data.puntoVenta,
      numero: data.numero,
      fechaEmision: this.formatDate(data.fechaEmision),

      // Receptor
      receptorNombre: data.receptorNombre,
      receptorCuit: this.formatCuit(data.receptorCuit),
      receptorCondicionIva:
        CONDICION_IVA_TEXTO[data.receptorCondicionIva || 5] || "Consumidor Final",
      receptorDomicilio: data.receptorDomicilio,

      // Importes
      importeNeto: this.formatCurrency(data.importeNeto, data.moneda),
      importeIva: data.importeIva
        ? this.formatCurrency(data.importeIva, data.moneda)
        : undefined,
      importeTotal: this.formatCurrency(data.importeTotal, data.moneda),

      // Concepto
      concepto: data.concepto,
      mostrarPeriodo:
        data.conceptoTipo !== 1 && !!data.periodoDesde && !!data.periodoHasta,
      periodoDesde: this.formatDate(data.periodoDesde),
      periodoHasta: this.formatDate(data.periodoHasta),
      vencimientoPago: this.formatDate(data.vencimientoPago),

      // CAE
      cae: data.cae,
      caeVencimiento: this.formatDate(data.caeVencimiento),

      // QR
      qrCodeUrl: data.qrCodeUrl,

      // Leyenda
      leyendaImpositiva:
        data.leyendaImpositiva || this.getLeyendaImpositiva(data.condicionIva),
    };
  }

  /**
   * Renderiza el componente React a HTML
   */
  renderTemplate(data: InvoiceData): string {
    const facturaData = this.toFacturaData(data);
    const element = React.createElement(FacturaTemplate, { data: facturaData });
    const componentHtml = ReactDOMServer.renderToStaticMarkup(element);

    // Wrap con HTML completo y estilos Tailwind
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura</title>
  <style>${TAILWIND_CSS}</style>
</head>
<body>
  ${componentHtml}
</body>
</html>`;
  }

  /**
   * Genera el PDF a partir de los datos de la factura
   */
  async generatePdf(data: InvoiceData): Promise<Buffer> {
    const html = this.renderTemplate(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "10mm",
          right: "10mm",
          bottom: "10mm",
          left: "10mm",
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Genera el nombre del archivo PDF
   */
  generateFilename(data: InvoiceData): string {
    const tipo = TIPO_COMPROBANTE_TEXTO[data.tipoComprobante].replace(/ /g, "_");
    const letra = TIPO_COMPROBANTE_LETRA[data.tipoComprobante];
    const pv = this.formatPuntoVenta(data.puntoVenta);
    const num = this.formatNumeroComprobante(data.numero);
    return `${tipo}_${letra}_${pv}-${num}.pdf`;
  }
}

export const pdfService = new PdfService();
