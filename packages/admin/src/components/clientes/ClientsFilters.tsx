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

interface ClientsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterPortal: string;
  onFilterPortalChange: (value: string) => void;
}

export function ClientsFilters({
  search,
  onSearchChange,
  filterPortal,
  onFilterPortalChange,
}: ClientsFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={filterPortal} onValueChange={onFilterPortalChange}>
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue placeholder="Portal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="true">Portal activo</SelectItem>
          <SelectItem value="false">Portal inactivo</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 w-[200px]"
        />
      </div>
    </div>
  );
}
