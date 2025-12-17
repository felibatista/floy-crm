"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination } from "./types";

interface ProjectsPaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export function ProjectsPagination({
  pagination,
  onPageChange,
}: ProjectsPaginationProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between p-2 border-t">
      <div className="text-xs text-muted-foreground">
        Página {pagination.page} de {pagination.totalPages} ({pagination.total}{" "}
        proyectos)
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
