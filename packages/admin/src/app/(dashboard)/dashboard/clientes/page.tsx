"use client";

import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ClientCreateDialog,
  ClientsTable,
  ClientsFilters,
  ClientsPagination,
  Client,
  Pagination,
  ClientFormData,
  initialFormData,
} from "@/components/clients";
import { useAuth } from "@/context";
import ClientsErrorPage from "@/components/clients/ClientsPageError";

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterPortal, setFilterPortal] = useState<string>("all");

  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [creating, setCreating] = useState(false);

  const { user, token } = useAuth();

  const fetchClients = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "50" });

        if (debouncedSearch) params.append("search", debouncedSearch);
        if (filterPortal !== "all")
          params.append("isPortalEnabled", filterPortal);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/clients?${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al cargar clientes");

        const data = await res.json();
        setClients(data.data);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filterPortal, token]
  );

  useEffect(() => {
    if (token) {
      fetchClients();
    }
  }, [fetchClients, token]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.slug) return;

    setCreating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/clients`,
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
        throw new Error(data.error || "Error al crear cliente");
      }

      setDialogOpen(false);
      setFormData(initialFormData);
      fetchClients();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (error) return <ClientsErrorPage />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2">
        <ClientCreateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          formData={formData}
          onFormChange={setFormData}
          onNameChange={handleNameChange}
          onCreate={handleCreate}
          creating={creating}
        />

        <div className="flex-1 flex justify-end">
          <ClientsFilters
            search={search}
            onSearchChange={setSearch}
            filterPortal={filterPortal}
            onFilterPortalChange={setFilterPortal}
          />
        </div>
      </div>

      <ClientsTable clients={clients} loading={loading} />

      <ClientsPagination pagination={pagination} onPageChange={fetchClients} />
    </div>
  );
}
