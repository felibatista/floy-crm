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
import { UserRoundPlus } from "lucide-react";
import { Lead, statusConfig } from "./types";

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-40" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
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
      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
        No hay leads
      </TableCell>
    </TableRow>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <UserRoundPlus className="h-4 w-4 text-muted-foreground" />
          {lead.name}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {lead.email || "-"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {lead.phone || "-"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {lead.company || "-"}
      </TableCell>
      <TableCell>
        <Badge variant={statusConfig[lead.status].variant}>
          {statusConfig[lead.status].label}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(lead.createdAt).toLocaleDateString("es-AR")}
      </TableCell>
    </TableRow>
  );
}

export function LeadsTable({ leads, loading }: LeadsTableProps) {
  return (
    <div className="border-t flex-1 overflow-auto">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : leads.length === 0 ? (
            <EmptyState />
          ) : (
            leads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
