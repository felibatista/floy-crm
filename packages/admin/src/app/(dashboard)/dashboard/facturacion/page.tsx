"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  BillingTable,
  BillingFilters,
  BillingPagination,
  BillingCreateDialog,
  BillingStatsCards,
  ArcaInvoice,
  Pagination,
  BillingStats,
  InvoiceFormData,
  initialFormData,
} from "@/components/billing";

export default function FacturacionPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Facturación | Acentus";
  }, []);

  const [invoices, setInvoices] = useState<ArcaInvoice[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);
  const [creating, setCreating] = useState(false);

  const fetchInvoices = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("admin_token");
        const params = new URLSearchParams({ page: String(page), limit: "50" });
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (filterStatus !== "all") params.append("status", filterStatus);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing?${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al cargar facturas");

        const data = await res.json();
        setInvoices(data.data);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filterStatus]
  );

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [fetchInvoices, fetchStats]);

  const handleCreate = async () => {
    if (!formData.receptorNombre || !formData.importeNeto || !formData.concepto) return;

    setCreating(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/billing`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            projectId: formData.projectId || undefined,
            paymentId: formData.paymentId || undefined,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear factura");
      }

      setDialogOpen(false);
      setFormData(initialFormData);
      fetchInvoices();
      fetchStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md m-2">
          {error}
        </div>
      )}

      <BillingStatsCards stats={stats} loading={loadingStats} />

      <div className="flex items-center justify-between p-2 border-t">
        <div className="flex items-center gap-2">
          <BillingCreateDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            formData={formData}
            onFormChange={setFormData}
            onCreate={handleCreate}
            creating={creating}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => router.push("/dashboard/facturacion/config")}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configuración ARCA
          </Button>
        </div>

        <div className="flex-1 flex justify-end">
          <BillingFilters
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />
        </div>
      </div>

      <BillingTable invoices={invoices} loading={loading} />

      <BillingPagination pagination={pagination} onPageChange={fetchInvoices} />
    </div>
  );
}
