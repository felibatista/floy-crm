export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  githubRepo: string | null;
  totalAmount: string | null;
  paidAmount: string;
  currency: string;
  paymentDueDate: string | null;
  createdAt: string;
  client: {
    id: number;
    name: string;
    slug: string;
  };
  _count: {
    tasks: number;
  };
}

export type ProjectStatus = "active" | "paused" | "completed" | "cancelled";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  totalAmount: string;
  paidAmount: string;
  currency: string;
  paymentDueDate: string;
  startDate: string;
  endDate: string;
  githubRepo: string;
}

export const initialFormData: ProjectFormData = {
  name: "",
  description: "",
  status: "active",
  totalAmount: "",
  paidAmount: "0",
  currency: "ARS",
  paymentDueDate: "",
  startDate: "",
  endDate: "",
  githubRepo: "",
};

export const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: "default" | "outline" | "success" | "destructive" }
> = {
  active: { label: "Activo", variant: "success" },
  paused: { label: "Pausado", variant: "default" },
  completed: { label: "Completado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};
