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
import { Task, statusMap } from "./types";

interface TasksTableProps {
  tasks: Task[];
  loading: boolean;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
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
        No hay tareas
      </TableCell>
    </TableRow>
  );
}

function getStatusBadge(status: string) {
  const info = statusMap[status] || {
    variant: "outline" as const,
    label: status,
  };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

function TaskRow({ task }: { task: Task }) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/dashboard/tareas/${task.code}`)}
    >
      <TableCell className="font-mono whitespace-nowrap">{task.code}</TableCell>
      <TableCell>{task.title}</TableCell>
      <TableCell>{getStatusBadge(task.status)}</TableCell>
      <TableCell className="text-muted-foreground">
        {task.assignedTo?.name || "-"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {task.timeSpent || "-"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {task.category ? <Badge variant="outline">{task.category}</Badge> : "-"}
      </TableCell>
    </TableRow>
  );
}

export function TasksTable({ tasks, loading }: TasksTableProps) {
  return (
    <div className="border-t flex-1 overflow-auto">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Código</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asignado</TableHead>
            <TableHead>Horas</TableHead>
            <TableHead>Categoría</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton />
          ) : tasks.length === 0 ? (
            <EmptyState />
          ) : (
            tasks.map((task) => <TaskRow key={task.id} task={task} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
