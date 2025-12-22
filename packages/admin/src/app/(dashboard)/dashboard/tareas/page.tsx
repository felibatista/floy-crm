"use client";

import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { useDebounce } from "@/hooks/use-debounce";
import {
  TaskCreateDialog,
  TasksTable,
  TasksGroupedTable,
  TasksFilters,
  TasksPagination,
  Task,
  Pagination,
  TaskFormData,
  User,
  Project,
  initialFormData,
} from "@/components/tareas";

export default function TareasPage() {
  useEffect(() => {
    document.title = "Tareas | Acentus";
  }, []);

  const [tasks, setTasks] = useState<Task[]>([]);
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
  const [filterStatus, setFilterStatus] = useState<string[]>([
    "draft",
    "pending",
    "in_progress",
  ]);
  const [groupBy, setGroupBy] = useState<string[]>([]);

  // Form state
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [creating, setCreating] = useState(false);

  const fetchTasks = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("admin_token");
        const params = new URLSearchParams({ page: String(page), limit: "50" });
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (filterStatus.length > 0) {
          filterStatus.forEach((status) => params.append("status", status));
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks?${params}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Error al cargar tareas");

        const data = await res.json();
        setTasks(data.data);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, filterStatus]
  );

  const fetchFormData = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      const [usersRes, projectsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
    } catch (err) {
      console.error("Error fetching form data:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchFormData();
  }, [fetchTasks]);

  const handleCreate = async () => {
    if (!formData.title || !formData.projectId) return;

    setCreating(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            projectId: parseInt(formData.projectId),
            assignedToId: formData.assignedToId
              ? parseInt(formData.assignedToId)
              : null,
          }),
        }
      );

      if (!res.ok) throw new Error("Error al crear tarea");

      setDialogOpen(false);
      setFormData(initialFormData);
      fetchTasks();
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

      <div className="flex items-center justify-between p-2 gap-2">
        <TaskCreateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          formData={formData}
          onFormChange={setFormData}
          onCreate={handleCreate}
          creating={creating}
          users={users}
          projects={projects}
        />

        <div className="flex-1 flex justify-end">
          <TasksFilters
            search={search}
            onSearchChange={setSearch}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
          />
        </div>
      </div>

      {groupBy.length === 0 ? (
        <TasksTable tasks={tasks} loading={loading} />
      ) : (
        <TasksGroupedTable tasks={tasks} loading={loading} groupBy={groupBy} />
      )}

      <TasksPagination pagination={pagination} onPageChange={fetchTasks} />
    </div>
  );
}
