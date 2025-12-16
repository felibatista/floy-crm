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

interface LeadsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
}

export function LeadsFilters({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
}: LeadsFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={filterStatus} onValueChange={onFilterStatusChange}>
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="new">Nuevo</SelectItem>
          <SelectItem value="contacted">Contactado</SelectItem>
          <SelectItem value="qualified">Calificado</SelectItem>
          <SelectItem value="converted">Convertido</SelectItem>
          <SelectItem value="lost">Perdido</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar leads..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 w-[200px]"
        />
      </div>
    </div>
  );
}
