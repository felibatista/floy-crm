"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { ArcaInvoiceStatus, statusConfig } from "./types";

interface BillingFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
}

export function BillingFilters({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
}: BillingFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, CUIT, CAE..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 w-64 text-xs"
        />
      </div>

      <Select value={filterStatus} onValueChange={onFilterStatusChange}>
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            Todos los estados
          </SelectItem>
          {(Object.keys(statusConfig) as ArcaInvoiceStatus[]).map((status) => (
            <SelectItem key={status} value={status} className="text-xs">
              {statusConfig[status].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
