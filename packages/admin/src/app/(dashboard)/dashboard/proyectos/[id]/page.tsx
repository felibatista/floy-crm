"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context";
import {
  ProjectDetail,
  ProjectDetailFormData,
  ProjectDetailHeader,
  ProjectDetailSkeleton,
  ProjectFormCard,
  ProjectPaymentCard,
  ProjectStatsCards,
  NoProjectError,
} from "@/components/projects/detail";

function formatDateForInput(dateString: string | null): string {
  if (!dateString) return "";
  return dateString.split("T")[0];
}

export default function ProyectoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState<ProjectDetailFormData>({
    name: "",
    description: "",
    status: "active",
    totalAmount: "",
    paidAmount: "0",
    currency: "ARS",
    paymentDueDate: "",
    startDate: "",
    endDate: "",
    githubRepo: "",
  });

  const { token } = useAuth();

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Proyecto no encontrado");
        }
        throw new Error("Error al cargar proyecto");
      }

      const data = await res.json();
      setProject(data);
      setFormData({
        name: data.name,
        description: data.description || "",
        status: data.status,
        totalAmount: data.totalAmount || "",
        paidAmount: data.paidAmount || "0",
        currency: data.currency || "ARS",
        paymentDueDate: formatDateForInput(data.paymentDueDate),
        startDate: formatDateForInput(data.startDate),
        endDate: formatDateForInput(data.endDate),
        githubRepo: data.githubRepo || "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProject();
    }
  }, [projectId, token]);

  const handleSave = async () => {
    if (!project || !formData.name) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects/${project.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || null,
            status: formData.status,
            totalAmount: formData.totalAmount ? parseFloat(formData.totalAmount) : null,
            paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : 0,
            currency: formData.currency,
            paymentDueDate: formData.paymentDueDate || null,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            githubRepo: formData.githubRepo || null,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar proyecto");
      }

      const updatedProject = await res.json();
      setProject({ ...project, ...updatedProject });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects/${project.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Error al eliminar proyecto");

      router.push("/dashboard/proyectos");
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  if (loading) return <ProjectDetailSkeleton />;
  if (error) return <NoProjectError />;

  return (
    <div className="h-full flex flex-col">
      <ProjectDetailHeader
        projectName={project?.name}
        saving={saving}
        deleting={deleting}
        deleteDialogOpen={deleteDialogOpen}
        onDeleteDialogOpenChange={setDeleteDialogOpen}
        onBack={() => router.push("/dashboard/proyectos")}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <ProjectFormCard formData={formData} onFormDataChange={setFormData} />
          </div>

          <div className="space-y-4">
            <ProjectStatsCards
              clientName={project?.client.name}
              clientSlug={project?.client.slug}
              tasksCount={project?._count.tasks}
              paymentsCount={project?._count.payments}
              filesCount={project?._count.files}
            />

            <ProjectPaymentCard formData={formData} onFormDataChange={setFormData} />
          </div>
        </div>
      </div>
    </div>
  );
}
