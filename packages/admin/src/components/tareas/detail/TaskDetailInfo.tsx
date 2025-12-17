"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, User, Project, TaskFormData } from "../types";

interface StatusInfo {
  label: string;
  color: string;
}

interface PriorityInfo {
  label: string;
  color: string;
}

interface TaskDetailInfoProps {
  task: Task | null;
  formData: TaskFormData;
  isDraft: boolean;
  users: User[];
  projects: Project[];
  statusInfo: StatusInfo;
  priorityInfo: PriorityInfo;
  onFieldChange: (field: keyof TaskFormData, value: string | boolean) => void;
  onCopyCode: () => void;
  totalTimeSpent?: string;
}

export function TaskDetailInfo({
  task,
  formData,
  isDraft,
  users,
  projects,
  statusInfo,
  priorityInfo,
  onFieldChange,
  onCopyCode,
  totalTimeSpent = "00:00",
}: TaskDetailInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    onCopyCode();
    setCopied(true);
    toast.success("Código copiado al portapapeles");
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <>
      {/* Título y código */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {isDraft ? (
            <Input
              value={formData.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              className="text-2xl font-bold mb-1 h-auto py-1 px-2"
              placeholder="Título de la tarea"
            />
          ) : (
            <h1 className="text-2xl font-bold mb-1">{formData.title}</h1>
          )}
          <div className="text-right items-start">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg">{task?.code}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Información en dos columnas */}
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-3 mb-6 text-xs">
        {/* Columna izquierda */}
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="w-40 text-muted-foreground">Proyecto</span>[
            {task?.project?.client?.name}] {task?.project?.name}
          </div>
          <div className="flex items-center">
            <span className="w-40 text-muted-foreground">Categoría</span>
            {isDraft ? (
              <Input
                value={formData.category}
                onChange={(e) => onFieldChange("category", e.target.value)}
                className="h-7 w-40"
                placeholder="Categoría"
              />
            ) : (
              <span>{formData.category || "-"}</span>
            )}
          </div>
          <div className="flex items-center">
            <span className="w-40 text-muted-foreground">Asignado a</span>
            {isDraft ? (
              <Select
                value={formData.assignedToId || "unassigned"}
                onValueChange={(v) =>
                  onFieldChange("assignedToId", v === "unassigned" ? "" : v)
                }
              >
                <SelectTrigger className="w-40 h-7">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span>{task?.assignedTo?.name || "Sin asignar"}</span>
            )}
          </div>
          <div className="flex items-center">
            <span className="w-40 text-muted-foreground">Tiempo estimado</span>
            {isDraft ? (
              <Input
                value={formData.timeEstimated}
                onChange={(e) => onFieldChange("timeEstimated", e.target.value)}
                className="h-7 w-24"
                placeholder="ej: 2h"
              />
            ) : (
              <span>{formData.timeEstimated || "00:00"}</span>
            )}
          </div>
          <div className="flex items-center">
            <span className="w-40 text-muted-foreground">Tiempo dedicado</span>
            <span className="font-mono font-medium">{totalTimeSpent}</span>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="w-40 text-muted-foreground">Fecha</span>
            <span>
              {task?.createdAt &&
                new Date(task.createdAt).toLocaleDateString("es-AR")}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-40 text-muted-foreground">Prioridad</span>
            {isDraft ? (
              <Select
                value={formData.priority}
                onValueChange={(v) => onFieldChange("priority", v)}
              >
                <SelectTrigger className="w-28 h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <span className={priorityInfo.color}>{priorityInfo.label}</span>
            )}
          </div>
          <div className="flex items-center">
            <span className="w-40 text-muted-foreground">Changelog</span>
            {isDraft ? (
              <input
                type="checkbox"
                checked={formData.includeInChangeLog}
                onChange={(e) =>
                  onFieldChange("includeInChangeLog", e.target.checked)
                }
                className="h-4 w-4"
              />
            ) : (
              <span>{formData.includeInChangeLog ? "Sí" : "No"}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
