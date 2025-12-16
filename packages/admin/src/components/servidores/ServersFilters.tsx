"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ServersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function ServersFilters({
  search,
  onSearchChange,
}: ServersFiltersProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar proyectos..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-8 h-8 w-[200px]"
      />
    </div>
  );
}
