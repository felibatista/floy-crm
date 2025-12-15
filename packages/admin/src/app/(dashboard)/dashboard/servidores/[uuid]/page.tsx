"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Database, Globe, Server } from "lucide-react";

const COOLIFY_URL = "https://coolify.acentus.com.ar";

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
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    setLoading(true);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectUuid]);

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase()?.split(":")[0] || "";

    const statusMap: Record<
      string,
      {
        variant:
          | "default"
          | "secondary"
          | "destructive"
          | "outline"
          | "yellow"
          | "blue"
          | "green"
          | "orange"
          | "purple";
        label: string;
      }
    > = {
      running: { variant: "green", label: "Activo" },
      exited: { variant: "destructive", label: "Detenido" },
      stopped: { variant: "destructive", label: "Detenido" },
      starting: { variant: "blue", label: "Iniciando" },
      restarting: { variant: "orange", label: "Reiniciando" },
    };

    const statusInfo = statusMap[normalizedStatus] || {
      variant: "outline",
      label: status || "Desconocido",
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getCoolifyUrl = (
    envUuid: string,
    resourceUuid: string,
    type: string
  ) => {
    const resourceType =
      type === "application"
        ? "application"
        : type === "service" || type === "minio"
        ? "service"
        : "database";
    return `${COOLIFY_URL}/project/${projectUuid}/environment/${envUuid}/${resourceType}/${resourceUuid}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{project?.name}</h1>
            <p className="text-muted-foreground">
              {project?.description || "Sin descripción"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            window.open(`${COOLIFY_URL}/project/${projectUuid}`, "_blank")
          }
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Abrir en Coolify
        </Button>
      </div>

      {project?.environments.map((env) => (
        <div key={env.id} className="space-y-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Server className="h-5 w-5" />
            Entorno: {env.name}
          </h2>

          {/* Applications */}
          {env.applications && env.applications.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Aplicaciones
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {env.applications.map((app) => (
                  <Card key={app.uuid}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{app.name}</CardTitle>
                        {getStatusBadge(app.status)}
                      </div>
                      <CardDescription className="text-xs truncate">
                        {app.fqdn || "Sin dominio"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          window.open(
                            getCoolifyUrl(env.uuid, app.uuid, "application"),
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir en Coolify
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Databases */}
          {env.databases && env.databases.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                Bases de datos
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {env.databases.map((db: any) => (
                  <Card key={db.uuid}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{db.name}</CardTitle>
                        {getStatusBadge(db.status)}
                      </div>
                      <CardDescription className="text-xs">
                        {db.type || "Database"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          window.open(
                            getCoolifyUrl(env.uuid, db.uuid, db.type),
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir en Coolify
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {env.services && env.services.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Server className="h-4 w-4" />
                Servicios
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {env.services.map((service: any) => (
                  <Card key={service.uuid}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {service.name}
                        </CardTitle>
                        {getStatusBadge(service.status)}
                      </div>
                      <CardDescription className="text-xs">
                        {service.type || "Service"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          window.open(
                            getCoolifyUrl(env.uuid, service.uuid, "service"),
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir en Coolify
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(!env.applications || env.applications.length === 0) &&
            (!env.databases || env.databases.length === 0) &&
            (!env.services || env.services.length === 0) && (
              <p className="text-muted-foreground text-sm">
                Este entorno no tiene recursos configurados.
              </p>
            )}
        </div>
      ))}

      {(!project?.environments || project.environments.length === 0) && (
        <p className="text-muted-foreground">
          Este proyecto no tiene entornos configurados.
        </p>
      )}
    </div>
  );
}
