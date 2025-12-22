"use client";

import { useState, useMemo } from "react";
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
import { Plus, Search } from "lucide-react";
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
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Get unique clients from projects
  const clients = useMemo(() => {
    const clientMap = new Map<number, { id: number; name: string }>();
    projects.forEach((project) => {
      if (project.client?.name && project.clientId) {
        clientMap.set(project.clientId, {
          id: project.clientId,
          name: project.client.name,
        });
      }
    });
    return Array.from(clientMap.values());
  }, [projects]);

  // Filter clients by search
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    return clients.filter((client) =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clients, clientSearch]);

  // Filter projects by selected client
  const filteredProjects = useMemo(() => {
    if (!selectedClientId) return [];
    return projects.filter((project) => project.clientId === selectedClientId);
  }, [projects, selectedClientId]);

  // Handle client selection
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(parseInt(clientId));
    onFormChange({ ...formData, projectId: "" }); // Reset project when client changes
  };

  // Reset when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setClientSearch("");
      setSelectedClientId(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Buscar cliente..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={selectedClientId?.toString() || ""}
                onValueChange={handleClientSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {filteredClients.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      No se encontraron clientes
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proyecto *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(v) =>
                  onFormChange({ ...formData, projectId: v })
                }
                disabled={!selectedClientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedClientId ? "Seleccionar proyecto" : "Primero selecciona un cliente"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredProjects.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      {selectedClientId ? "No hay proyectos para este cliente" : "Selecciona un cliente primero"}
                    </div>
                  ) : (
                    filteredProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              onClick={() => handleOpenChange(false)}
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
