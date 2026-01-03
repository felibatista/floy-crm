"use client";

import { Copy, Check, ExternalLink, Globe, Database, Server } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

interface ServerDetailInfoProps {
  project: Project | null;
  projectUuid: string;
}

export function ServerDetailInfo({ project, projectUuid }: ServerDetailInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUuid = () => {
    if (project?.uuid) {
      navigator.clipboard.writeText(project.uuid);
      setCopied(true);
      toast.success("UUID copiado al portapapeles");
      setTimeout(() => setCopied(false), 5000);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toLowerCase()?.split(":")[0] || "";

    const statusMap: Record<
      string,
      {
        variant:
          | "default"
          | "destructive"
          | "outline"
          | "yellow"
          | "blue"
          | "success"
          | "orange"
          | "purple"
          | "info";
        label: string;
      }
    > = {
      running: { variant: "success", label: "Activo" },
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

  // Contadores de recursos
  const totalApps = project?.environments.reduce(
    (acc, env) => acc + (env.applications?.length || 0),
    0
  ) || 0;
  const totalDatabases = project?.environments.reduce(
    (acc, env) => acc + (env.databases?.length || 0),
    0
  ) || 0;
  const totalServices = project?.environments.reduce(
    (acc, env) => acc + (env.services?.length || 0),
    0
  ) || 0;

  return (
    <>
      {/* Título y UUID */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{project?.name}</h1>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {project?.uuid}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopyUuid}
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Entornos con sus recursos */}
      {project?.environments.map((env) => (
        <div key={env.id} className="mb-6">
          <h2 className="text-sm font-medium flex items-center gap-2 mb-4 pb-2 border-b">
            <Server className="h-4 w-4" />
            Entorno: {env.name}
          </h2>

          {/* Applications */}
          {env.applications && env.applications.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-3">
                <Globe className="h-3 w-3" />
                Aplicaciones
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {env.applications.map((app) => (
                  <Card key={app.uuid} className="border">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{app.name}</CardTitle>
                        {getStatusBadge(app.status)}
                      </div>
                      <CardDescription className="text-xs truncate">
                        {app.fqdn || "Sin dominio"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-xs"
                        onClick={() =>
                          window.open(
                            getCoolifyUrl(env.uuid, app.uuid, "application"),
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
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
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-3">
                <Database className="h-3 w-3" />
                Bases de datos
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {env.databases.map((db: any) => (
                  <Card key={db.uuid} className="border">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{db.name}</CardTitle>
                        {getStatusBadge(db.status)}
                      </div>
                      <CardDescription className="text-xs">
                        {db.type || "Database"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-xs"
                        onClick={() =>
                          window.open(
                            getCoolifyUrl(env.uuid, db.uuid, db.type),
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
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
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-2 mb-3">
                <Server className="h-3 w-3" />
                Servicios
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {env.services.map((service: any) => (
                  <Card key={service.uuid} className="border">
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{service.name}</CardTitle>
                        {getStatusBadge(service.status)}
                      </div>
                      <CardDescription className="text-xs">
                        {service.type || "Service"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-xs"
                        onClick={() =>
                          window.open(
                            getCoolifyUrl(env.uuid, service.uuid, "service"),
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
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
              <p className="text-muted-foreground text-xs">
                Este entorno no tiene recursos configurados.
              </p>
            )}
        </div>
      ))}

      {(!project?.environments || project.environments.length === 0) && (
        <p className="text-muted-foreground text-sm">
          Este proyecto no tiene entornos configurados.
        </p>
      )}
    </>
  );
}
