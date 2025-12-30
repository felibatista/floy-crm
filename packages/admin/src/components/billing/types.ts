export interface ArcaInvoice {
  id: number;
  userId: number;
  projectId: number | null;
  paymentId: number | null;
  tipoComprobante: ArcaInvoiceType;
  puntoVenta: number;
  numero: number | null;
  receptorNombre: string;
  receptorCuit: string | null;
  receptorDomicilio: string | null;
  importeNeto: string;
  importeTotal: string;
  moneda: string;
  concepto: string;
  conceptoTipo: number;
  periodoDesde: string | null;
  periodoHasta: string | null;
  vencimientoPago: string | null;
  cae: string | null;
  caeVencimiento: string | null;
  status: ArcaInvoiceStatus;
  pdfUrl: string | null;
  pdfFilename: string | null;
  afipResponse: string | null;
  errorMessage: string | null;
  fechaEmision: string;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: number;
    name: string;
    email: string;
  };
  project?: {
    id: number;
    name: string;
    client?: {
      id: number;
      name: string;
      slug: string;
    };
  } | null;
  payment?: {
    id: number;
    amount: string;
    concept: string | null;
    status: string;
  } | null;
}

export type ArcaInvoiceStatus = "draft" | "pending" | "authorized" | "rejected" | "cancelled";
export type ArcaInvoiceType = "factura_c" | "nota_credito_c" | "nota_debito_c";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BillingStats {
  total: number;
  draft: number;
  pending: number;
  authorized: number;
  rejected: number;
  totalAuthorizedAmount: string;
}

export interface InvoiceFormData {
  projectId: string;
  paymentId: string;
  tipoComprobante: ArcaInvoiceType;
  receptorNombre: string;
  receptorCuit: string;
  receptorCondicionIva: string;
  receptorDomicilio: string;
  importeNeto: string;
  importeTotal: string;
  moneda: string;
  concepto: string;
  conceptoTipo: string;
  periodoDesde: string;
  periodoHasta: string;
  vencimientoPago: string;
}

export const initialFormData: InvoiceFormData = {
  projectId: "",
  paymentId: "",
  tipoComprobante: "factura_c",
  receptorNombre: "",
  receptorCuit: "",
  receptorCondicionIva: "5",
  receptorDomicilio: "",
  importeNeto: "",
  importeTotal: "",
  moneda: "PES",
  concepto: "",
  conceptoTipo: "2",
  periodoDesde: "",
  periodoHasta: "",
  vencimientoPago: "",
};

// Condición IVA del receptor según AFIP (RG 5616)
export const condicionIvaReceptorConfig: Record<string, string> = {
  "1": "IVA Responsable Inscripto",
  "4": "IVA Sujeto Exento",
  "5": "Consumidor Final",
  "6": "Responsable Monotributo",
  "8": "Proveedor del Exterior",
  "9": "Cliente del Exterior",
  "10": "IVA Liberado - Ley 19.640",
  "13": "Monotributista Social",
  "15": "IVA No Alcanzado",
};

export const statusConfig: Record<ArcaInvoiceStatus, { label: string; variant: "default" | "info" | "destructive" | "outline" | "success" | "yellow" }> = {
  draft: { label: "Borrador", variant: "default" },
  pending: { label: "Pendiente", variant: "yellow" },
  authorized: { label: "Autorizada", variant: "success" },
  rejected: { label: "Rechazada", variant: "destructive" },
  cancelled: { label: "Anulada", variant: "destructive" },
};

export const tipoComprobanteConfig: Record<ArcaInvoiceType, { label: string; code: number }> = {
  factura_c: { label: "Factura C", code: 11 },
  nota_credito_c: { label: "Nota de Crédito C", code: 13 },
  nota_debito_c: { label: "Nota de Débito C", code: 12 },
};

export const conceptoTipoConfig: Record<string, string> = {
  "1": "Productos",
  "2": "Servicios",
  "3": "Productos y Servicios",
};
