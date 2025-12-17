"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context";
import {
  ClientDetail,
  ClientDetailFormData,
  ClientDetailHeader,
  ClientDetailSkeleton,
  ClientFormCard,
  ClientStatsCards,
  ClientProjectsCard,
  ClientTicketsCard,
  NoClientError,
} from "@/components/clients/details";

export default function ClienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientSlug = params.slug as string;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<ClientDetailFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    slug: "",
    address: "",
    isPortalEnabled: false,
  });

  const { token } = useAuth();

  const fetchClient = async () => {
    setLoading(true);
    setError(null);
    try {
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
        slug: data.slug || "",
        isPortalEnabled: data.isPortalEnabled,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchClient();
    }
  }, [clientSlug, token]);

  const handleSave = async () => {
    if (!client || !formData.name) return;

    setSaving(true);
    setError(null);
    try {
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
      setClient({ ...client, ...updatedClient });
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

  const handleSaveRepo = async (projectId: number, githubRepo: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects/${projectId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ githubRepo: githubRepo || null }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al guardar repositorio");
    }

    if (client) {
      setClient({
        ...client,
        projects: client.projects.map((p) =>
          p.id === projectId ? { ...p, githubRepo: githubRepo || null } : p
        ),
      });
    }
  };

  const handleCreateProject = async (
    name: string,
    description: string,
    githubRepo: string
  ) => {
    if (!client) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          clientId: client.id,
          githubRepo: githubRepo || null,
        }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al crear proyecto");
    }

    const newProject = await res.json();

    setClient({
      ...client,
      projects: [
        ...client.projects,
        {
          id: newProject.id,
          name: newProject.name,
          status: newProject.status,
          githubRepo: newProject.githubRepo,
          createdAt: newProject.createdAt,
        },
      ],
      _count: {
        ...client._count,
        projects: client._count.projects + 1,
      },
    });
  };

  if (loading) return <ClientDetailSkeleton />;
  if (error) return <NoClientError />;

  return (
    <div className="h-full flex flex-col">
      <ClientDetailHeader
        clientName={client?.name}
        saving={saving}
        deleting={deleting}
        deleteDialogOpen={deleteDialogOpen}
        onDeleteDialogOpenChange={setDeleteDialogOpen}
        onBack={() => router.push("/dashboard/clientes")}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <ClientFormCard formData={formData} onFormDataChange={setFormData} />

          <div className="space-y-4">
            <ClientStatsCards
              projectsCount={client?._count.projects}
              ticketsCount={client?._count.tickets}
              isPortalEnabled={client?.isPortalEnabled}
            />

            <ClientProjectsCard
              clientName={client?.name}
              projects={client?.projects || []}
              onCreateProject={handleCreateProject}
              onSaveRepo={handleSaveRepo}
            />

            <ClientTicketsCard tickets={client?.tickets || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
