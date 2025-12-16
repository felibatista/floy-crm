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
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from "./types";

interface ServersTableProps {
  projects: Project[];
  loading: boolean;
  emptyMessage?: string;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
        {message}
      </TableCell>
    </TableRow>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/dashboard/servidores/${project.uuid}`)}
    >
      <TableCell className="font-medium">{project.name}</TableCell>
      <TableCell className="text-muted-foreground">
        {project.description || "Sin descripción"}
      </TableCell>
    </TableRow>
  );
}

export function ServersTable({
  projects,
  loading,
  emptyMessage = "No hay proyectos disponibles",
}: ServersTableProps) {
  return (
    <div className="border-t flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : projects.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : (
            projects.map((project) => (
              <ProjectRow key={project.uuid} project={project} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
