export interface Project {
  id: number;
  name: string;
  status: string;
  githubRepo: string | null;
  createdAt: string;
}

export interface TicketItem {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

export interface ClientDetail {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  slug: string;
  isPortalEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  projects: Project[];
  tickets: TicketItem[];
  _count: {
    projects: number;
    tickets: number;
  };
}

export interface ClientDetailFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  slug: string;
  address: string;
  isPortalEnabled: boolean;
}
