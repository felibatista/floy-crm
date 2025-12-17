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
import { Building2, Globe } from "lucide-react";
import { Client } from "./types";

interface ClientsTableProps {
  clients: Client[];
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
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
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
        No hay clientes
      </TableCell>
    </TableRow>
  );
}

function ClientRow({ client }: { client: Client }) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/dashboard/clientes/${client.slug}`)}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          {client.name}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {client.email || "-"}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{client._count.projects}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{client._count.tickets}</Badge>
      </TableCell>
      <TableCell>
        {client.isPortalEnabled ? (
          <Badge variant="success" className="gap-1">
            <Globe className="h-3 w-3" />
            Activo
          </Badge>
        ) : (
          <Badge variant="outline">Inactivo</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

export function ClientsTable({ clients, loading }: ClientsTableProps) {
  return (
    <div className="border-t flex-1 overflow-auto">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Proyectos</TableHead>
            <TableHead>Tickets</TableHead>
            <TableHead>Portal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : clients.length === 0 ? (
            <EmptyState />
          ) : (
            clients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
