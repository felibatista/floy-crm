"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Trash2, GitCommit, List } from "lucide-react";
import {
  Task,
  User,
  Project,
  TaskFormData,
  statusConfig,
  priorityConfig,
  TaskDetailWorkflowHeader,
  TaskDetailInfo,
  TaskDescriptionContent,
} from "@/components/tareas";
import { WorkLogsList, WorkLog } from "@/components/worklogs";
import { CommitsList } from "@/components/commits";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

const workflowSteps = [
  { key: "draft", label: "Borrador" },
  { key: "pending", label: "Pendiente" },
  { key: "in_progress", label: "En Progreso" },
  { key: "completed", label: "Completada" },
];

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
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [totalTimeSpent, setTotalTimeSpent] = useState<string>("00:00");

  const [formData, setFormData] = useState<TaskFormData>({
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

  const [initialFormData, setInitialFormData] = useState<TaskFormData | null>(
    null
  );

  const isDraft = formData.status === "draft";
  const hasChanges = initialFormData
    ? JSON.stringify({ ...formData, status: undefined }) !==
      JSON.stringify({ ...initialFormData, status: undefined })
    : false;

  // Calcula el tiempo total de los workLogs
  const calculateTotalTime = (logs: WorkLog[]) => {
    let totalMinutes = 0;
    for (const log of logs) {
      totalMinutes += log.hours * 60 + log.minutes;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleWorkLogAdded = (newWorkLog: WorkLog) => {
    const updatedLogs = [newWorkLog, ...workLogs].sort(
      (a, b) =>
        new Date(b.dateWorked).getTime() - new Date(a.dateWorked).getTime()
    );
    setWorkLogs(updatedLogs);
    setTotalTimeSpent(calculateTotalTime(updatedLogs));
  };

  const handleWorkLogDeleted = (id: number) => {
    const updatedLogs = workLogs.filter((log) => log.id !== id);
    setWorkLogs(updatedLogs);
    setTotalTimeSpent(calculateTotalTime(updatedLogs));
  };

  const fetchTask = useCallback(async () => {
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
      const loadedFormData = {
        title: data.title || "",
        description: data.description || "",
        projectId: data.projectId?.toString() || "",
        assignedToId: data.assignedToId?.toString() || "",
        category: data.category || "",
        status: data.status || "draft",
        priority: data.priority || "medium",
        timeEstimated: data.timeEstimated || "",
        timeSpent: data.timeSpent || "",
        includeInChangeLog: data.includeInChangeLog || false,
      };
      setFormData(loadedFormData);
      setInitialFormData(loadedFormData);

      // Fetch workLogs for this task
      const workLogsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/worklogs?taskId=${data.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (workLogsRes.ok) {
        const workLogsData = await workLogsRes.json();
        const logs = workLogsData.data || [];
        setWorkLogs(logs);
        setTotalTimeSpent(calculateTotalTime(logs));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [taskCode]);

  const fetchFormData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchTask();
    fetchFormData();
  }, [fetchTask, fetchFormData]);

  const handleFieldChange = (
    field: keyof TaskFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
      setInitialFormData(formData); // Reset initial state after successful save
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
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

    setFormData((prev) => ({ ...prev, status: newStatus }));

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

  const statusInfo = statusConfig[
    formData.status as keyof typeof statusConfig
  ] || {
    label: formData.status,
    color: "bg-gray-500",
  };
  const priorityInfo = priorityConfig[
    formData.priority as keyof typeof priorityConfig
  ] || {
    label: formData.priority,
    color: "text-gray-500",
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-muted/30 px-4 py-2 flex items-center justify-between gap-4">
        <ButtonGroup>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Menubar className="border-0 p-0 h-auto rounded-none">
            <MenubarMenu>
              <MenubarTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 border-l-0 rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="w-full justify-start disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    className="w-full justify-start"
                  >
                    Eliminar
                  </Button>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </ButtonGroup>

        <TaskDetailWorkflowHeader
          currentStatus={formData.status}
          workflowSteps={workflowSteps}
          onStatusChange={handleStatusChange}
        />
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <TaskDetailInfo
            task={task}
            formData={formData}
            isDraft={isDraft}
            users={users}
            projects={projects}
            statusInfo={statusInfo}
            priorityInfo={priorityInfo}
            onFieldChange={handleFieldChange}
            onCopyCode={copyCode}
            totalTimeSpent={totalTimeSpent}
          />

          <Tabs defaultValue="descripcion" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="descripcion"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Descripción
              </TabsTrigger>
              <TabsTrigger
                value="trabajos"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                Trabajos
              </TabsTrigger>
              <TabsTrigger
                value="commits"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                <GitCommit className="h-4 w-4 mr-1" />
                Commits
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
              <TaskDescriptionContent
                task={task}
                description={formData.description}
                isDraft={isDraft}
                onDescriptionChange={(value: string) =>
                  handleFieldChange("description", value)
                }
              />
            </TabsContent>

            <TabsContent value="trabajos" className="mt-4">
              {task && (
                <WorkLogsList
                  taskId={task.id}
                  workLogs={workLogs}
                  onWorkLogAdded={handleWorkLogAdded}
                  onWorkLogDeleted={handleWorkLogDeleted}
                />
              )}
            </TabsContent>

            <TabsContent value="commits" className="mt-4">
              {task && <CommitsList taskId={task.id} />}
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
