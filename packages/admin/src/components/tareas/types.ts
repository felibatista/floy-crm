export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  client: { name: string | null };
}

export interface Task {
  id: number;
  code: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string | null;
  timeSpent: string | null;
  timeEstimated: string | null;
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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  assignedToId: string;
  category: string;
  status: string;
  priority: string;
  timeEstimated: string;
  timeSpent: string;
  includeInChangeLog: boolean;
}

export const initialFormData: TaskFormData = {
  title: "",
  description: "",
  projectId: "",
  assignedToId: "",
  category: "",
  status: "pending",
  priority: "medium",
  timeEstimated: "",
  timeSpent: "",
  includeInChangeLog: false,
};

export const statusMap: Record<
  string,
  {
    variant:
      | "default"
      | "destructive"
      | "outline"
      | "yellow"
      | "blue"
      | "success"
      | "orange"
      | "purple"
      | "info";
    label: string;
  }
> = {
  draft: { variant: "default", label: "Borrador" },
  pending: { variant: "yellow", label: "Pendiente" },
  in_progress: { variant: "blue", label: "En progreso" },
  completed: { variant: "success", label: "Completada" },
  cancelled: { variant: "destructive", label: "Cancelada" },
};

export const statusConfig = {
  draft: { label: "Borrador", color: "bg-gray-500" },
  pending: { label: "Pendiente", color: "bg-yellow-500" },
  in_progress: { label: "En progreso", color: "bg-blue-500" },
  completed: { label: "Completada", color: "bg-green-500" },
  cancelled: { label: "Cancelada", color: "bg-red-500" },
};

export const workflowSteps = [
  { key: "draft", label: "Borrador" },
  { key: "pending", label: "Pendiente" },
  { key: "in_progress", label: "En progreso" },
  { key: "completed", label: "Completada" },
  { key: "cancelled", label: "Cancelada" },
];

export const priorityConfig = {
  low: { label: "Baja", color: "text-gray-500" },
  medium: { label: "Media", color: "text-yellow-500" },
  high: { label: "Alta", color: "text-orange-500" },
  critical: { label: "Crítica", color: "text-red-500" },
};

export const categoryOptions = [
  { value: "feature", label: "Funcionalidad" },
  { value: "bug", label: "Error" },
  { value: "improvement", label: "Mejora" },
  { value: "task", label: "Tarea" },
  { value: "other", label: "Otro" },
];
