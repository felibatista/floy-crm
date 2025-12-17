export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

export interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  notes: string;
}

export const initialFormData: LeadFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "new",
  notes: "",
};

export const statusConfig: Record<
  LeadStatus,
  {
    label: string;
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
  }
> = {
  new: { label: "Nuevo", variant: "blue" },
  contacted: { label: "Contactado", variant: "purple" },
  qualified: { label: "Calificado", variant: "orange" },
  converted: { label: "Convertido", variant: "success" },
  lost: { label: "Perdido", variant: "destructive" },
};
