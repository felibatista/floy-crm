"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface TasksFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  categories: string[];
  groupBy: string[];
  onGroupByChange: (value: string[]) => void;
}

export function TasksFilters({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryChange,
  categories,
  groupBy,
  onGroupByChange,
}: TasksFiltersProps) {
  const groupOptions = [
    { value: "client", label: "Cliente" },
    { value: "project", label: "Proyecto" },
    { value: "status", label: "Estado" },
    { value: "priority", label: "Prioridad" },
  ];

  const handleGroupToggle = (value: string) => {
    if (groupBy.includes(value)) {
      onGroupByChange(groupBy.filter((g) => g !== value));
    } else {
      onGroupByChange([...groupBy, value]);
    }
  };

  const handleRemoveGroup = (value: string) => {
    onGroupByChange(groupBy.filter((g) => g !== value));
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Select value="" onValueChange={handleGroupToggle}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Agrupar por" />
          </SelectTrigger>
          <SelectContent>
            {groupOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={groupBy.includes(option.value)}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {groupBy.length > 0 && (
          <div className="flex items-center gap-1">
            {groupBy.map((group, index) => {
              const option = groupOptions.find((o) => o.value === group);
              return (
                <Badge
                  key={group}
                  variant="secondary"
                  className="text-xs flex items-center gap-1"
                >
                  {index > 0 && <span className="text-muted-foreground">→</span>}
                  {option?.label}
                  <button
                    onClick={() => handleRemoveGroup(group)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

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
