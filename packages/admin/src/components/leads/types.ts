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
      | "secondary"
      | "outline"
      | "destructive"
      | "blue"
      | "purple"
      | "orange"
      | "green";
  }
> = {
  new: { label: "Nuevo", variant: "blue" },
  contacted: { label: "Contactado", variant: "purple" },
  qualified: { label: "Calificado", variant: "orange" },
  converted: { label: "Convertido", variant: "green" },
  lost: { label: "Perdido", variant: "destructive" },
};
