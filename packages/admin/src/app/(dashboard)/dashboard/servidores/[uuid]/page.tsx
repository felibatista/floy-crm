"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { ServerDetailHeader, ServerDetailInfo } from "@/components/servidores";

interface Application {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  fqdn: string | null;
  status: string;
  type?: string;
}

interface Environment {
  id: number;
  uuid: string;
  name: string;
  applications?: Application[];
  databases?: any[];
  services?: any[];
}

interface Project {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  environments: Environment[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectUuid = params.uuid as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/coolify/projects/${projectUuid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error al cargar el proyecto");
      }

      const data = await res.json();
      setProject(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectUuid]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project?.name) {
      document.title = `${project.name} | Acentus`;
    }
  }, [project?.name]);

  const handleRefresh = () => {
    fetchProject(true);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b py-4 px-6">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="h-full flex flex-col p-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mt-4">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ServerDetailHeader
        projectUuid={projectUuid}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <ServerDetailInfo project={project} projectUuid={projectUuid} />
        </div>
      </div>
    </div>
  );
}
