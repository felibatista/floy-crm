"use client";

import { useEffect, useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { ServersTable, ServersFilters, Project } from "@/components/servidores";

export default function ServidoresPage() {
  useEffect(() => {
    document.title = "Servidores | Acentus";
  }, []);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/coolify/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error al cargar proyectos");
      }

      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (!debouncedSearch) return projects;
    const searchLower = debouncedSearch.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
    );
  }, [projects, debouncedSearch]);

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end p-2">
        <ServersFilters search={search} onSearchChange={setSearch} />
      </div>

      <ServersTable
        projects={filteredProjects}
        loading={loading}
        emptyMessage={
          search
            ? "No se encontraron proyectos"
            : "No hay proyectos disponibles"
        }
      />
    </div>
  );
}
