export interface WorkLogUser {
  id: number;
  name: string;
  email: string;
}

export interface WorkLog {
  id: number;
  taskId: number;
  userId: number;
  summary: string;
  hours: number;
  minutes: number;
  type: WorkLogType;
  dateWorked: string;
  createdAt: string;
  updatedAt: string;
  user: WorkLogUser;
}

export type WorkLogType =
  | "desarrollo"
  | "gestion"
  | "testing"
  | "documentacion"
  | "reunion"
  | "otro";

export interface WorkLogFormData {
  summary: string;
  hours: string;
  minutes: string;
  type: WorkLogType;
  dateWorked: string;
}

export const workLogTypeConfig: Record<
  WorkLogType,
  { label: string; color: string }
> = {
  desarrollo: { label: "Desarrollo", color: "bg-blue-500" },
  gestion: { label: "Gestión", color: "bg-purple-500" },
  testing: { label: "Testing", color: "bg-green-500" },
  documentacion: { label: "Documentación", color: "bg-yellow-500" },
  reunion: { label: "Reunión", color: "bg-orange-500" },
  otro: { label: "Otro", color: "bg-gray-500" },
};

export const workLogTypeOptions: { value: WorkLogType; label: string }[] = [
  { value: "desarrollo", label: "Desarrollo" },
  { value: "gestion", label: "Gestión" },
  { value: "testing", label: "Testing" },
  { value: "documentacion", label: "Documentación" },
  { value: "reunion", label: "Reunión" },
  { value: "otro", label: "Otro" },
];

export interface WorkLogStats {
  totalTime: {
    hours: number;
    minutes: number;
    totalMinutes: number;
    formatted: string;
  };
  totalEntries: number;
  byType: Record<string, number>;
  byUser: Record<string, { name: string; minutes: number }>;
  lastEntry: WorkLog | null;
}

export const initialWorkLogFormData: WorkLogFormData = {
  summary: "",
  hours: "0",
  minutes: "0",
  type: "desarrollo",
  dateWorked: new Date().toISOString().split("T")[0],
};
