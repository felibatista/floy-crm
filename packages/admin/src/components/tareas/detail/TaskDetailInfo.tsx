"use client";

import { Copy } from "lucide-react";
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
  return (
    <>
      {/* Título y código */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {isDraft ? (
            <Input
              value={formData.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
              className="text-2xl font-bold mb-2 h-auto py-1 px-2"
              placeholder="Título de la tarea"
            />
          ) : (
            <h1 className="text-2xl font-bold mb-2">{formData.title}</h1>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Proyecto:{" "}
              {isDraft ? (
                <Select
                  value={formData.projectId}
                  onValueChange={(v) => onFieldChange("projectId", v)}
                >
                  <SelectTrigger className="w-[200px] h-7 inline-flex ml-1">
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-foreground">{task?.project?.name}</span>
              )}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">Tarea</div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg">
              {task?.code.slice(-8).toUpperCase()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onCopyCode}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Información en dos columnas */}
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-3 mb-6 text-xs">
        {/* Columna izquierda */}
        <div className="space-y-3">
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
            <span className="w-40 text-muted-foreground">Estado</span>
            <Badge className={statusInfo.color + " text-white"}>
              {statusInfo.label}
            </Badge>
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
