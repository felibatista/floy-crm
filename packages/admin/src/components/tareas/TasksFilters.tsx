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

interface TasksFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  categories: string[];
}

export function TasksFilters({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryChange,
  categories,
}: TasksFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={filterStatus} onValueChange={onFilterStatusChange}>
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="draft">Borrador</SelectItem>
          <SelectItem value="pending">Pendiente</SelectItem>
          <SelectItem value="in_progress">En progreso</SelectItem>
          <SelectItem value="completed">Completada</SelectItem>
          <SelectItem value="cancelled">Cancelada</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tareas..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-8 w-[200px]"
        />
      </div>
    </div>
  );
}
