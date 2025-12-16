"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Github,
  GitCommit,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface GitHubStats {
  totalCommits: number;
  reposConfigured: number;
  lastSync: string | null;
  commitsByRepo: { repository: string; count: number }[];
  isConfigured: boolean;
}

interface SyncLog {
  id: number;
  repository: string;
  status: string;
  commitsFound: number;
  commitsLinked: number;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
}

interface ProjectWithRepo {
  id: number;
  name: string;
  githubRepo: string;
  client: { id: number; name: string; slug: string };
  _count: { tasks: number };
}

export default function GitHubPage() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [projects, setProjects] = useState<ProjectWithRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    try {
      const [statsRes, logsRes, projectsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/github/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/github/sync-logs?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/github/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (logsRes.ok) setSyncLogs(await logsRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/github/sync`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refetch data after sync
      await fetchData();
    } catch (error) {
      console.error("Error syncing:", error);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!stats?.isConfigured) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Github className="h-8 w-8" />
          <h1 className="text-2xl font-bold">GitHub</h1>
        </div>

        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Configuración requerida
            </CardTitle>
            <CardDescription>
              Para usar la integración con GitHub, necesitas configurar el token de acceso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Agrega la variable <code className="bg-muted px-1 py-0.5 rounded">GITHUB_TOKEN</code> en el archivo <code className="bg-muted px-1 py-0.5 rounded">.env</code> del backend con un Personal Access Token de GitHub.
            </p>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">GITHUB_TOKEN=ghp_xxxxxxxxxxxx</code>
            </div>
            <p className="text-sm text-muted-foreground">
              El token necesita permisos de lectura en los repositorios que quieras sincronizar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Github className="h-8 w-8" />
          <h1 className="text-2xl font-bold">GitHub</h1>
        </div>
        <Button onClick={handleSync} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sincronizar ahora"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <GitCommit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commits Vinculados</p>
                <p className="text-2xl font-bold">{stats.totalCommits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <Github className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Repos Configurados</p>
                <p className="text-2xl font-bold">{stats.reposConfigured}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="text-lg font-semibold text-green-600">Activo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última Sync</p>
                <p className="text-sm font-medium">{formatDate(stats.lastSync)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proyectos Configurados */}
        <Card>
          <CardHeader>
            <CardTitle>Proyectos con Repositorio</CardTitle>
            <CardDescription>
              Proyectos que tienen un repositorio de GitHub configurado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No hay proyectos con repositorios configurados.
                <br />
                Configura un repositorio en la página de Cliente.
              </p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.client.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {project.githubRepo}
                      </code>
                      <a
                        href={`https://github.com/${project.githubRepo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commits por Repo */}
        <Card>
          <CardHeader>
            <CardTitle>Commits por Repositorio</CardTitle>
            <CardDescription>
              Cantidad de commits vinculados a tareas por repositorio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.commitsByRepo.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No hay commits vinculados todavía.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.commitsByRepo.map((repo) => (
                  <div
                    key={repo.repository}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <code className="text-sm">{repo.repository}</code>
                    <Badge variant="secondary">{repo.count} commits</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historial de Sincronización */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Sincronización</CardTitle>
          <CardDescription>Últimas 10 sincronizaciones</CardDescription>
        </CardHeader>
        <CardContent>
          {syncLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay historial de sincronización todavía.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repositorio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Encontrados</TableHead>
                  <TableHead>Vinculados</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <code className="text-sm">{log.repository}</code>
                    </TableCell>
                    <TableCell>
                      {log.status === "success" ? (
                        <Badge variant="outline" className="bg-green-500 text-white border-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Éxito
                        </Badge>
                      ) : log.status === "error" ? (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Ejecutando
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{log.commitsFound}</TableCell>
                    <TableCell>{log.commitsLinked}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.startedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
