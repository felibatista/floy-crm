export interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  slug: string;
  isPortalEnabled: boolean;
  createdAt: string;
  _count: {
    projects: number;
    tickets: number;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  slug: string;
  isPortalEnabled: boolean;
}

export const initialFormData: ClientFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  slug: "",
  isPortalEnabled: false,
};
