import { ProjectStatus } from "../types";

export interface ProjectDetail {
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
    payments: number;
    files: number;
  };
}

export interface ProjectDetailFormData {
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

export const initialFormData: ProjectDetailFormData = {
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
