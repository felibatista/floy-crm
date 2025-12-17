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
import { Progress } from "@/components/ui/progress";
import { FolderKanban, Building2 } from "lucide-react";
import { Project, statusConfig } from "./types";

interface ProjectsTableProps {
  projects: Project[];
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
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
        No hay proyectos
      </TableCell>
    </TableRow>
  );
}

function formatCurrency(amount: string | null, currency: string): string {
  if (!amount) return "-";
  const num = parseFloat(amount);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "ARS",
  }).format(num);
}

function getPaymentProgress(totalAmount: string | null, paidAmount: string): number {
  if (!totalAmount) return 0;
  const total = parseFloat(totalAmount);
  const paid = parseFloat(paidAmount);
  if (total === 0) return 0;
  return Math.min((paid / total) * 100, 100);
}

function ProjectRow({ project }: { project: Project }) {
  const router = useRouter();
  const progress = getPaymentProgress(project.totalAmount, project.paidAmount);
  const status = statusConfig[project.status];

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/dashboard/proyectos/${project.id}`)}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
          {project.name}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-3 w-3" />
          {project.client.name}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={status.variant}>{status.label}</Badge>
      </TableCell>
      <TableCell>
        {project.totalAmount ? (
          <div className="space-y-1 min-w-[150px]">
            <div className="flex justify-between text-xs">
              <span>{formatCurrency(project.paidAmount, project.currency)}</span>
              <span className="text-muted-foreground">
                / {formatCurrency(project.totalAmount, project.currency)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{project._count.tasks}</Badge>
      </TableCell>
    </TableRow>
  );
}

export function ProjectsTable({ projects = [], loading }: ProjectsTableProps) {
  const projectList = projects || [];

  return (
    <div className="border-t flex-1 overflow-auto">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead>Proyecto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Pagos</TableHead>
            <TableHead>Tareas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : projectList.length === 0 ? (
            <EmptyState />
          ) : (
            projectList.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
