"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Clock, Plus } from "lucide-react";
import { WorkLog, workLogTypeConfig } from "./types";
import { WorkLogModal } from "./WorkLogModal";

interface WorkLogsListProps {
  taskId: number;
  workLogs: WorkLog[];
  onWorkLogAdded: (workLog: WorkLog) => void;
  onWorkLogDeleted: (id: number) => void;
}

export function WorkLogsList({
  taskId,
  workLogs,
  onWorkLogAdded,
  onWorkLogDeleted,
}: WorkLogsListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este registro de trabajo?")) return;

    // Optimistic delete
    onWorkLogDeleted(id);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/worklogs/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Error al eliminar");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    }
  };

  const formatTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar trabajo
        </Button>
      </div>

      {workLogs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No hay registros de trabajo todavía.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resumen de trabajo</TableHead>
                <TableHead className="w-[120px]">Tiempo Dedicado</TableHead>
                <TableHead className="w-[120px]">Tipo de Trabajo</TableHead>
                <TableHead className="w-[120px]">Fecha</TableHead>
                <TableHead className="w-[150px]">Realizado por</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workLogs.map((log) => {
                const typeConfig = workLogTypeConfig[log.type] || {
                  label: log.type,
                  color: "bg-gray-500",
                };
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.summary}</TableCell>
                    <TableCell className="font-mono">
                      {formatTime(log.hours, log.minutes)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${typeConfig.color} text-white border-0`}
                      >
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.dateWorked)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.user.name}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(log.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <WorkLogModal
        taskId={taskId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={onWorkLogAdded}
      />
    </div>
  );
}
