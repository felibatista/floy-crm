"use client";

import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  LeadCreateDialog,
  LeadsTable,
  LeadsFilters,
  LeadsPagination,
  Lead,
  Pagination,
  LeadFormData,
  initialFormData,
} from "@/components/leads";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [creating, setCreating] = useState(false);

  const fetchLeads = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("admin_token");
        const params = new URLSearchParams({ page: String(page), limit: "50" });
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (filterStatus !== "all") params.append("status", filterStatus);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/leads?${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al cargar leads");

        const data = await res.json();
        setLeads(data.data);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filterStatus]
  );

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleCreate = async () => {
    if (!formData.name) return;

    setCreating(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/leads`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear lead");
      }

      setDialogOpen(false);
      setFormData(initialFormData);
      fetchLeads();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between p-2">
        <LeadCreateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          formData={formData}
          onFormChange={setFormData}
          onCreate={handleCreate}
          creating={creating}
        />

        <div className="flex-1 flex justify-end">
          <LeadsFilters
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />
        </div>
      </div>

      <LeadsTable leads={leads} loading={loading} />

      <LeadsPagination pagination={pagination} onPageChange={fetchLeads} />
    </div>
  );
}
