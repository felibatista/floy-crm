"use client";

import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ProjectsTable,
  ProjectsFilters,
  ProjectsPagination,
  Project,
  Pagination,
} from "@/components/projects";
import { useAuth } from "@/context";

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { token } = useAuth();

  const fetchProjects = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(page), limit: "50" });

        if (debouncedSearch) params.append("search", debouncedSearch);
        if (filterStatus !== "all") params.append("status", filterStatus);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects?${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al cargar proyectos");

        const data = await res.json();
        // Handle both { data: [], pagination: {} } and direct array response
        const projectsData = Array.isArray(data) ? data : data.data || [];
        setProjects(projectsData);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filterStatus, token]
  );

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [fetchProjects, token]);

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <p>Error al cargar proyectos</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2">
        <div />
        <div className="flex-1 flex justify-end">
          <ProjectsFilters
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />
        </div>
      </div>

      <ProjectsTable projects={projects} loading={loading} />

      <ProjectsPagination
        pagination={pagination}
        onPageChange={fetchProjects}
      />
    </div>
  );
}
