"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Send,
  Trash2,
  FileText,
  Building2,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  ArcaInvoice,
  statusConfig,
  tipoComprobanteConfig,
  conceptoTipoConfig,
} from "@/components/billing/types";

function formatCurrency(amount: string | number, currency: string = "ARS") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency === "PES" ? "ARS" : currency,
  }).format(num);
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("es-AR");
}

export default function FacturaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<ArcaInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorizing, setAuthorizing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    document.title = "Factura | Acentus";
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing/${invoiceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 404) throw new Error("Factura no encontrada");
        throw new Error("Error al cargar factura");
      }

      const data = await res.json();
      setInvoice(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async () => {
    if (!invoice) return;

    setAuthorizing(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/arca/authorize/${invoice.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al autorizar factura");
      }

      // Refresh invoice data
      fetchInvoice();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthorizing(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing/${invoice.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar factura");
      }

      router.push("/dashboard/facturacion");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium">{error || "Factura no encontrada"}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/dashboard/facturacion")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Facturación
        </Button>
      </div>
    );
  }

  const invoiceNumber = invoice.numero
    ? `${String(invoice.puntoVenta).padStart(4, "0")}-${String(invoice.numero).padStart(8, "0")}`
    : "Sin número";

  const canAuthorize = invoice.status === "draft" || invoice.status === "rejected";
  const canDelete = invoice.status !== "authorized";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold font-mono">{invoiceNumber}</h1>
              <Badge variant={statusConfig[invoice.status].variant}>
                {statusConfig[invoice.status].label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {tipoComprobanteConfig[invoice.tipoComprobante]?.label} -{" "}
              {formatDate(invoice.fechaEmision)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canAuthorize && (
            <Button onClick={handleAuthorize} disabled={authorizing}>
              {authorizing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar a AFIP
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 m-4 rounded-md flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Datos del Comprobante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="font-medium">
                    {tipoComprobanteConfig[invoice.tipoComprobante]?.label}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Punto de Venta</p>
                  <p className="font-medium">{invoice.puntoVenta}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Número</p>
                  <p className="font-medium font-mono">{invoice.numero || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha Emisión</p>
                  <p className="font-medium">{formatDate(invoice.fechaEmision)}</p>
                </div>
              </div>

              {invoice.cae && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      Factura Autorizada
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">CAE</p>
                      <p className="font-medium font-mono">{invoice.cae}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vencimiento CAE</p>
                      <p className="font-medium">{formatDate(invoice.caeVencimiento)}</p>
                    </div>
                  </div>
                </div>
              )}

              {invoice.errorMessage && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">Error</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{invoice.errorMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Receptor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Datos del Receptor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="text-muted-foreground">Nombre / Razón Social</p>
                <p className="font-medium">{invoice.receptorNombre}</p>
              </div>
              {invoice.receptorCuit && (
                <div className="text-sm">
                  <p className="text-muted-foreground">CUIT</p>
                  <p className="font-medium">{invoice.receptorCuit}</p>
                </div>
              )}
              {invoice.receptorDomicilio && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Domicilio</p>
                  <p className="font-medium">{invoice.receptorDomicilio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Importes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Importe Neto</p>
                  <p className="font-medium">
                    {formatCurrency(invoice.importeNeto, invoice.moneda)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Importe Total</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(invoice.importeTotal, invoice.moneda)}
                  </p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Moneda</p>
                <p className="font-medium">
                  {invoice.moneda === "PES" ? "Pesos Argentinos" : invoice.moneda}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Concept */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Concepto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="text-muted-foreground">Tipo de Concepto</p>
                <p className="font-medium">
                  {conceptoTipoConfig[String(invoice.conceptoTipo)] ||
                    invoice.conceptoTipo}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Descripción</p>
                <p className="font-medium">{invoice.concepto}</p>
              </div>
              {invoice.conceptoTipo !== 1 && (
                <div className="grid grid-cols-3 gap-4 text-sm border-t pt-4">
                  <div>
                    <p className="text-muted-foreground">Período Desde</p>
                    <p className="font-medium">{formatDate(invoice.periodoDesde)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Período Hasta</p>
                    <p className="font-medium">{formatDate(invoice.periodoHasta)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vto. Pago</p>
                    <p className="font-medium">{formatDate(invoice.vencimientoPago)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked Items */}
          {(invoice.project || invoice.payment) && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Vinculaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {invoice.project && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{invoice.project.name}</p>
                        {invoice.project.client && (
                          <p className="text-xs text-muted-foreground">
                            {invoice.project.client.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {invoice.payment && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Pago #{invoice.payment.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(invoice.payment.amount)} -{" "}
                          {invoice.payment.concept || "Sin concepto"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Factura</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
