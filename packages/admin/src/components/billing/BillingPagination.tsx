"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination } from "./types";

interface BillingPaginationProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export function BillingPagination({
  pagination,
  onPageChange,
}: BillingPaginationProps) {
  const { page, totalPages, total } = pagination;

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground">
      <span>
        Mostrando página {page} de {totalPages} ({total} facturas)
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-7 px-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-7 px-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
