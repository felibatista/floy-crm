"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Trash2,
  Building2,
  FolderOpen,
  Ticket,
  Globe,
  Github,
  Check,
  X,
  Pencil,
  Plus,
} from "lucide-react";

interface Project {
  id: number;
  name: string;
  status: string;
  githubRepo: string | null;
  createdAt: string;
}

interface TicketItem {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  slug: string;
  isPortalEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  projects: Project[];
  tickets: TicketItem[];
  _count: {
    projects: number;
    tickets: number;
  };
}

export default function ClienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientSlug = params.slug as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // GitHub repo editing state
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingRepoValue, setEditingRepoValue] = useState("");
  const [savingRepo, setSavingRepo] = useState(false);

  // Create project modal state
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectGithubRepo, setNewProjectGithubRepo] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    slug: "",
    isPortalEnabled: false,
  });

  const fetchClient = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/clients/slug/${clientSlug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Cliente no encontrado");
        }
        throw new Error("Error al cargar cliente");
      }

      const data = await res.json();
      setClient(data);
      setFormData({
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        company: data.company || "",
        address: data.address || "",
        slug: data.slug,
        isPortalEnabled: data.isPortalEnabled,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [clientSlug]);

  const handleSave = async () => {
    if (!client || !formData.name || !formData.slug) return;

    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/clients/${client.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar cliente");
      }

      const updatedClient = await res.json();

      // If slug changed, redirect to new URL
      if (formData.slug !== clientSlug) {
        router.push(`/dashboard/clientes/${formData.slug}`);
      } else {
        setClient({ ...client, ...updatedClient });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!client) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/clients/${client.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Error al eliminar cliente");

      router.push("/dashboard/clientes");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const handleEditRepo = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingRepoValue(project.githubRepo || "");
  };

  const handleCancelEditRepo = () => {
    setEditingProjectId(null);
    setEditingRepoValue("");
  };

  const handleSaveRepo = async (projectId: number) => {
    setSavingRepo(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ githubRepo: editingRepoValue || null }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar repositorio");
      }

      // Update local state
      if (client) {
        setClient({
          ...client,
          projects: client.projects.map((p) =>
            p.id === projectId
              ? { ...p, githubRepo: editingRepoValue || null }
              : p
          ),
        });
      }
      setEditingProjectId(null);
      setEditingRepoValue("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingRepo(false);
    }
  };

  const handleCreateProject = async () => {
    if (!client || !newProjectName.trim()) return;

    setCreatingProject(true);
    setError(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newProjectName.trim(),
            description: newProjectDescription.trim() || null,
            clientId: client.id,
            githubRepo: newProjectGithubRepo.trim() || null,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear proyecto");
      }

      const newProject = await res.json();

      // Update local state
      setClient({
        ...client,
        projects: [...client.projects, {
          id: newProject.id,
          name: newProject.name,
          status: newProject.status,
          githubRepo: newProject.githubRepo,
          createdAt: newProject.createdAt,
        }],
        _count: {
          ...client._count,
          projects: client._count.projects + 1,
        },
      });

      // Reset form and close modal
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectGithubRepo("");
      setCreateProjectOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingProject(false);
    }
  };

  const getStatusBadge = (status: string) => {
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
      active: { variant: "green", label: "Activo" },
      paused: { variant: "yellow", label: "Pausado" },
      completed: { variant: "purple", label: "Completado" },
      cancelled: { variant: "destructive", label: "Cancelado" },
      open: { variant: "blue", label: "Abierto" },
      in_progress: { variant: "orange", label: "En progreso" },
      resolved: { variant: "green", label: "Resuelto" },
      closed: { variant: "outline", label: "Cerrado" },
    };
    const info = statusMap[status] || { variant: "outline", label: status };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/clientes")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a clientes
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md m-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/clientes")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-sm font-semibold">{client?.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar cliente?</DialogTitle>
                <DialogDescription>
                  Esta acción no se puede deshacer. Se eliminarán también todos
                  los proyectos, tickets y datos asociados a este cliente.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Información del cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (subdominio) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, ""),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Portal habilitado</Label>
                  <Select
                    value={formData.isPortalEnabled ? "yes" : "no"}
                    onValueChange={(v) =>
                      setFormData({ ...formData, isPortalEnabled: v === "yes" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Sí</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats & Related */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">
                        {client?._count.projects}
                      </p>
                      <p className="text-xs text-muted-foreground">Proyectos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">
                        {client?._count.tickets}
                      </p>
                      <p className="text-xs text-muted-foreground">Tickets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">
                        {client?.isPortalEnabled ? "Sí" : "No"}
                      </p>
                      <p className="text-xs text-muted-foreground">Portal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Proyectos ({client?.projects.length || 0})
                  </CardTitle>
                  <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Nuevo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear nuevo proyecto</DialogTitle>
                        <DialogDescription>
                          Ingresa los datos del nuevo proyecto para {client?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="projectName">Nombre *</Label>
                          <Input
                            id="projectName"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            placeholder="Nombre del proyecto"
                            disabled={creatingProject}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="projectDescription">Descripción</Label>
                          <Textarea
                            id="projectDescription"
                            value={newProjectDescription}
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            placeholder="Descripción del proyecto (opcional)"
                            rows={3}
                            disabled={creatingProject}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="projectGithubRepo">Repositorio GitHub</Label>
                          <div className="flex items-center gap-2">
                            <Github className="h-4 w-4 text-muted-foreground" />
                            <Input
                              id="projectGithubRepo"
                              value={newProjectGithubRepo}
                              onChange={(e) => setNewProjectGithubRepo(e.target.value)}
                              placeholder="owner/repo"
                              disabled={creatingProject}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setCreateProjectOpen(false)}
                          disabled={creatingProject}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleCreateProject}
                          disabled={creatingProject || !newProjectName.trim()}
                        >
                          {creatingProject ? "Creando..." : "Crear proyecto"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {client?.projects.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sin proyectos</p>
                ) : (
                  <div className="space-y-3">
                    {client?.projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-3 rounded-md border text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{project.name}</span>
                          {getStatusBadge(project.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Github className="h-3 w-3 text-muted-foreground" />
                          {editingProjectId === project.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingRepoValue}
                                onChange={(e) =>
                                  setEditingRepoValue(e.target.value)
                                }
                                placeholder="owner/repo"
                                className="h-7 text-xs flex-1"
                                disabled={savingRepo}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleSaveRepo(project.id)}
                                disabled={savingRepo}
                              >
                                <Check className="h-3 w-3 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleCancelEditRepo}
                                disabled={savingRepo}
                              >
                                <X className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-muted-foreground">
                                {project.githubRepo || "Sin repositorio"}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleEditRepo(project)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  Últimos tickets ({client?.tickets.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client?.tickets.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Sin tickets</p>
                ) : (
                  <div className="space-y-2">
                    {client?.tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-2 rounded-md border text-xs"
                      >
                        <span className="font-medium truncate">
                          {ticket.title}
                        </span>
                        {getStatusBadge(ticket.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
