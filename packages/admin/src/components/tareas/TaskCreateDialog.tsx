"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { TaskFormData, User, Project } from "./types";

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: TaskFormData;
  onFormChange: (data: TaskFormData) => void;
  onCreate: () => void;
  creating: boolean;
  users: User[];
  projects: Project[];
}

export function TaskCreateDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onCreate,
  creating,
  users,
  projects,
}: TaskCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear nueva tarea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                onFormChange({ ...formData, title: e.target.value })
              }
              placeholder="Título de la tarea"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                onFormChange({ ...formData, description: e.target.value })
              }
              placeholder="Descripción de la tarea"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Proyecto *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(v) =>
                  onFormChange({ ...formData, projectId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Asignado a</Label>
              <Select
                value={formData.assignedToId}
                onValueChange={(v) =>
                  onFormChange({ ...formData, assignedToId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => onFormChange({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) =>
                  onFormChange({ ...formData, priority: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  onFormChange({ ...formData, category: e.target.value })
                }
                placeholder="ej: Backend, Frontend"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeEstimated">Tiempo estimado</Label>
              <Input
                id="timeEstimated"
                value={formData.timeEstimated}
                onChange={(e) =>
                  onFormChange({ ...formData, timeEstimated: e.target.value })
                }
                placeholder="ej: 2h, 1d"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button
              onClick={onCreate}
              disabled={creating || !formData.title || !formData.projectId}
            >
              {creating ? "Creando..." : "Crear tarea"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
