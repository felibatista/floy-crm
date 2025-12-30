"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Building2, CreditCard } from "lucide-react";
import { ArcaInvoice, statusConfig, tipoComprobanteConfig } from "./types";

interface BillingTableProps {
  invoices: ArcaInvoice[];
  loading: boolean;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
        No hay facturas
      </TableCell>
    </TableRow>
  );
}

function formatCurrency(amount: string | number, currency: string = "ARS") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency === "PES" ? "ARS" : currency,
  }).format(num);
}

function InvoiceRow({ invoice }: { invoice: ArcaInvoice }) {
  const router = useRouter();

  const invoiceNumber = invoice.numero
    ? `${String(invoice.puntoVenta).padStart(4, "0")}-${String(invoice.numero).padStart(8, "0")}`
    : "Sin número";

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/dashboard/facturacion/${invoice.id}`)}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-xs">{invoiceNumber}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="font-normal">
          {tipoComprobanteConfig[invoice.tipoComprobante]?.label || invoice.tipoComprobante}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{invoice.receptorNombre}</span>
          {invoice.receptorCuit && (
            <span className="text-xs text-muted-foreground">{invoice.receptorCuit}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="font-mono text-right">
        {formatCurrency(invoice.importeTotal, invoice.moneda)}
      </TableCell>
      <TableCell>
        <Badge variant={statusConfig[invoice.status].variant}>
          {statusConfig[invoice.status].label}
        </Badge>
      </TableCell>
      <TableCell>
        {invoice.project ? (
          <div className="flex items-center gap-1 text-xs">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <span className="truncate max-w-[150px]">{invoice.project.name}</span>
          </div>
        ) : invoice.payment ? (
          <div className="flex items-center gap-1 text-xs">
            <CreditCard className="h-3 w-3 text-muted-foreground" />
            <span>Pago #{invoice.payment.id}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(invoice.fechaEmision).toLocaleDateString("es-AR")}
      </TableCell>
    </TableRow>
  );
}

export function BillingTable({ invoices, loading }: BillingTableProps) {
  return (
    <div className="border-t flex-1 overflow-auto">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Receptor</TableHead>
            <TableHead className="text-right">Importe</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Vinculación</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : invoices.length === 0 ? (
            <EmptyState />
          ) : (
            invoices.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
