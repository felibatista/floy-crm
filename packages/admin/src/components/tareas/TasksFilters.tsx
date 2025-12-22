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
import { Button } from "@/components/ui/button";
import { Search, X, RotateCcw } from "lucide-react";

interface TasksFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: string[];
  onFilterStatusChange: (value: string[]) => void;
  groupBy: string[];
  onGroupByChange: (value: string[]) => void;
}

export function TasksFilters({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  groupBy,
  onGroupByChange,
}: TasksFiltersProps) {
  const groupOptions = [
    { value: "client", label: "Cliente" },
    { value: "project", label: "Proyecto" },
    { value: "status", label: "Estado" },
    { value: "priority", label: "Prioridad" },
    { value: "category", label: "Categoría" },
  ];

  const statusOptions = [
    { value: "draft", label: "Borrador" },
    { value: "pending", label: "Pendiente" },
    { value: "in_progress", label: "En progreso" },
    { value: "completed", label: "Completada" },
    { value: "cancelled", label: "Cancelada" },
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

  const handleStatusToggle = (value: string) => {
    // Si todos los estados están seleccionados, al hacer clic en uno, solo ese se queda
    const allStatuses = statusOptions.map((opt) => opt.value);
    const allSelected = allStatuses.every((status) =>
      filterStatus.includes(status)
    );

    if (allSelected) {
      onFilterStatusChange([value]);
    } else if (filterStatus.includes(value)) {
      onFilterStatusChange(filterStatus.filter((s) => s !== value));
    } else {
      onFilterStatusChange([...filterStatus, value]);
    }
  };

  const getStatusLabel = () => {
    if (filterStatus.length === 0) {
      return "Estado";
    }
    if (filterStatus.length === 1) {
      return (
        statusOptions.find((s) => s.value === filterStatus[0])?.label ||
        "Estado"
      );
    }
    return `${filterStatus.length} estados`;
  };

  const handleClearStatusFilters = () => {
    onFilterStatusChange([
      "draft",
      "pending",
      "in_progress",
      "completed",
      "cancelled",
    ]);
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
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                >
                  {index > 0 && (
                    <span className="text-muted-foreground">→</span>
                  )}
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

      <Select value="" onValueChange={handleStatusToggle}>
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue placeholder={getStatusLabel()} />
        </SelectTrigger>
        <SelectContent>
          <div className="px-2 py-1.5 border-b text-center mb-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearStatusFilters}
              className="w-full text-xs h-7"
            >
              Mostrar todos
            </Button>
          </div>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span
                  className={
                    filterStatus.includes(option.value)
                      ? "text-muted-foreground"
                      : ""
                  }
                >
                  {option.label}
                </span>
              </div>
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
