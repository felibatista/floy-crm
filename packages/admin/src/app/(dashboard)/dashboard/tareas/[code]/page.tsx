"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Trash2, Copy } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  code: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  timeEstimated: string | null;
  timeSpent: string | null;
  startDate: string | null;
  endDate: string | null;
  includeInChangeLog: boolean;
  assignedTo: User | null;
  project: Project;
  projectId: number;
  assignedToId: number | null;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<
  string,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "outline"
      | "destructive"
      | "green"
      | "orange"
      | "blue"
      | "yellow"
      | "purple";
  }
> = {
  draft: { label: "Borrador", variant: "secondary" },
  pending: { label: "Pendiente", variant: "orange" },
  in_progress: { label: "En Progreso", variant: "blue" },
  completed: { label: "Completada", variant: "green" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

// Workflow steps order
const workflowSteps = [
  { key: "draft", label: "Borrador" },
  { key: "pending", label: "Pendiente" },
  { key: "in_progress", label: "En Progreso" },
  { key: "completed", label: "Completada" },
];

const priorityConfig: Record<
  string,
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "outline"
      | "destructive"
      | "green"
      | "orange"
      | "blue"
      | "yellow"
      | "purple";
  }
> = {
  low: { label: "Baja", variant: "secondary" },
  medium: { label: "Media", variant: "blue" },
  high: { label: "Alta", variant: "orange" },
  urgent: { label: "Urgente", variant: "destructive" },
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskCode = params.code as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedToId: "",
    category: "",
    status: "draft",
    priority: "medium",
    timeEstimated: "",
    timeSpent: "",
    includeInChangeLog: false,
  });

  const isDraft = formData.status === "draft";

  const fetchTask = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks/code/${taskCode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Error al cargar la tarea");

      const data = await res.json();
      setTask(data);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        projectId: data.projectId?.toString() || "",
        assignedToId: data.assignedToId?.toString() || "",
        category: data.category || "",
        status: data.status || "pending",
        priority: data.priority || "medium",
        timeEstimated: data.timeEstimated || "",
        timeSpent: data.timeSpent || "",
        includeInChangeLog: data.includeInChangeLog || false,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      const [usersRes, projectsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
    } catch (err) {
      console.error("Error fetching form data:", err);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchFormData();
  }, [taskCode]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            projectId: parseInt(formData.projectId),
            assignedToId: formData.assignedToId
              ? parseInt(formData.assignedToId)
              : null,
          }),
        }
      );

      if (!res.ok) throw new Error("Error al guardar la tarea");

      const updated = await res.json();
      setTask(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm("¿Estás seguro de eliminar esta tarea?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks/${task.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Error al eliminar la tarea");

      router.push("/dashboard/tareas");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyCode = () => {
    if (task?.code) {
      navigator.clipboard.writeText(task.code.slice(-8).toUpperCase());
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!task || newStatus === formData.status) return;

    // No permitir volver a borrador una vez que salió de ese estado
    if (newStatus === "draft" && formData.status !== "draft") return;

    setFormData({ ...formData, status: newStatus });

    // Auto-save status change
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            status: newStatus,
            projectId: parseInt(formData.projectId),
            assignedToId: formData.assignedToId
              ? parseInt(formData.assignedToId)
              : null,
          }),
        }
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="h-full flex flex-col p-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mt-4">
          {error}
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[formData.status] || {
    label: formData.status,
    variant: "default" as const,
  };
  const priorityInfo = priorityConfig[formData.priority] || {
    label: formData.priority,
    variant: "default" as const,
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header con estado de workflow - clickeable */}
      <div className="border-b bg-muted/30">
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
          {workflowSteps.map((step, index) => {
            const isDisabled =
              step.key === "draft" && formData.status !== "draft";
            return (
              <div key={step.key} className="flex items-center gap-1">
                {index > 0 && (
                  <span className="text-muted-foreground mx-1">→</span>
                )}
                <Badge
                  variant={formData.status === step.key ? "blue" : "outline"}
                  className={`whitespace-nowrap transition-all ${
                    formData.status === step.key ? "ring-2 ring-blue-300" : ""
                  } ${
                    isDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:scale-105 hover:bg-muted"
                  }`}
                  onClick={() => !isDisabled && handleStatusChange(step.key)}
                >
                  {step.label}
                </Badge>
              </div>
            );
          })}
          <span className="text-muted-foreground mx-1">|</span>
          <Badge
            variant={
              formData.status === "cancelled" ? "destructive" : "outline"
            }
            className={`cursor-pointer whitespace-nowrap transition-all hover:scale-105 ${
              formData.status === "cancelled"
                ? "ring-2 ring-red-300"
                : "hover:bg-muted"
            }`}
            onClick={() => handleStatusChange("cancelled")}
          >
            Cancelada
          </Badge>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Título y código */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              {isDraft ? (
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="text-2xl font-bold mb-2 h-auto py-1 px-2"
                  placeholder="Título de la tarea"
                />
              ) : (
                <h1 className="text-2xl font-bold mb-2">{formData.title}</h1>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Proyecto:{" "}
                  {isDraft ? (
                    <Select
                      value={formData.projectId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, projectId: v })
                      }
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
                    <span className="text-foreground">
                      {task?.project?.name}
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Tarea</div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg">
                  {task?.code.slice(-8).toUpperCase()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={copyCode}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Información en dos columnas */}
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-3 mb-6 text-sm">
            {/* Columna izquierda */}
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-40 text-muted-foreground">Categoría</span>
                {isDraft ? (
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
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
                      setFormData({
                        ...formData,
                        assignedToId: v === "unassigned" ? "" : v,
                      })
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
                <span className="w-40 text-muted-foreground">
                  Tiempo estimado
                </span>
                {isDraft ? (
                  <Input
                    value={formData.timeEstimated}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeEstimated: e.target.value,
                      })
                    }
                    className="h-7 w-24"
                    placeholder="ej: 2h"
                  />
                ) : (
                  <span>{formData.timeEstimated || "00:00"}</span>
                )}
              </div>
              <div className="flex items-center">
                <span className="w-40 text-muted-foreground">
                  Tiempo dedicado
                </span>
                <Input
                  value={formData.timeSpent}
                  onChange={(e) =>
                    setFormData({ ...formData, timeSpent: e.target.value })
                  }
                  className="h-7 w-24"
                  placeholder="ej: 1h"
                />
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
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
              <div className="flex items-center">
                <span className="w-40 text-muted-foreground">Prioridad</span>
                {isDraft ? (
                  <Select
                    value={formData.priority}
                    onValueChange={(v) =>
                      setFormData({ ...formData, priority: v })
                    }
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
                  <Badge variant={priorityInfo.variant}>
                    {priorityInfo.label}
                  </Badge>
                )}
              </div>
              <div className="flex items-center">
                <span className="w-40 text-muted-foreground">Changelog</span>
                {isDraft ? (
                  <input
                    type="checkbox"
                    checked={formData.includeInChangeLog}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        includeInChangeLog: e.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                ) : (
                  <span>{formData.includeInChangeLog ? "Sí" : "No"}</span>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 mb-6">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="descripcion" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="descripcion"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Descripción
              </TabsTrigger>
              <TabsTrigger
                value="historial"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Historial
              </TabsTrigger>
              <TabsTrigger
                value="relacionadas"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Tareas Relacionadas
              </TabsTrigger>
              <TabsTrigger
                value="tickets"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Tickets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="descripcion" className="mt-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span>{task?.assignedTo?.name || "Sin asignar"}</span>
                  <span>•</span>
                  <span>
                    {task?.createdAt &&
                      new Date(task.createdAt).toLocaleString("es-AR")}
                  </span>
                </div>
                {isDraft ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={8}
                    placeholder="Descripción de la tarea..."
                    className="bg-background"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {formData.description ? (
                      <p className="whitespace-pre-wrap">
                        {formData.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        Sin descripción
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="historial" className="mt-4">
              <div className="text-muted-foreground text-sm">
                <p>Historial de cambios de la tarea.</p>
                <p className="mt-2 italic">Próximamente...</p>
              </div>
            </TabsContent>

            <TabsContent value="relacionadas" className="mt-4">
              <div className="text-muted-foreground text-sm">
                <p>Tareas relacionadas con esta.</p>
                <p className="mt-2 italic">Próximamente...</p>
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="mt-4">
              <div className="text-muted-foreground text-sm">
                <p>Tickets asociados a esta tarea.</p>
                <p className="mt-2 italic">Próximamente...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
