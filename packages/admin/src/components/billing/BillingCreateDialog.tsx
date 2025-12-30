"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import {
  InvoiceFormData,
  tipoComprobanteConfig,
  conceptoTipoConfig,
  ArcaInvoiceType,
} from "./types";

interface Project {
  id: number;
  name: string;
  client: {
    name: string;
  };
}

interface BillingCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: InvoiceFormData;
  onFormChange: (data: InvoiceFormData) => void;
  onCreate: () => void;
  creating: boolean;
}

export function BillingCreateDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onCreate,
  creating,
}: BillingCreateDialogProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/projects`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleChange = (field: keyof InvoiceFormData, value: string) => {
    onFormChange({ ...formData, [field]: value });
  };

  // Auto-calculate importeTotal when importeNeto changes (for Monotributo, no IVA)
  useEffect(() => {
    if (formData.importeNeto) {
      handleChange("importeTotal", formData.importeNeto);
    }
  }, [formData.importeNeto]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-xs">
          <Plus className="h-4 w-4 mr-1" />
          Nueva Factura
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Factura ARCA</DialogTitle>
          <DialogDescription>
            Crea una nueva factura electrónica para enviar a AFIP.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoComprobante">Tipo de Comprobante</Label>
              <Select
                value={formData.tipoComprobante}
                onValueChange={(value) =>
                  handleChange("tipoComprobante", value as ArcaInvoiceType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(tipoComprobanteConfig) as ArcaInvoiceType[]).map(
                    (tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipoComprobanteConfig[tipo].label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId">Proyecto (opcional)</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) => handleChange("projectId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin proyecto</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name} ({project.client.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Datos del Receptor</h4>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="receptorNombre">Nombre / Razón Social *</Label>
                <Input
                  id="receptorNombre"
                  value={formData.receptorNombre}
                  onChange={(e) => handleChange("receptorNombre", e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receptorCuit">CUIT (opcional)</Label>
                  <Input
                    id="receptorCuit"
                    value={formData.receptorCuit}
                    onChange={(e) => handleChange("receptorCuit", e.target.value)}
                    placeholder="XX-XXXXXXXX-X"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receptorDomicilio">Domicilio (opcional)</Label>
                  <Input
                    id="receptorDomicilio"
                    value={formData.receptorDomicilio}
                    onChange={(e) =>
                      handleChange("receptorDomicilio", e.target.value)
                    }
                    placeholder="Dirección"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Importes</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="importeNeto">Importe Neto *</Label>
                <Input
                  id="importeNeto"
                  type="number"
                  step="0.01"
                  value={formData.importeNeto}
                  onChange={(e) => handleChange("importeNeto", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="importeTotal">Importe Total *</Label>
                <Input
                  id="importeTotal"
                  type="number"
                  step="0.01"
                  value={formData.importeTotal}
                  onChange={(e) => handleChange("importeTotal", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Concepto</h4>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="conceptoTipo">Tipo de Concepto</Label>
                  <Select
                    value={formData.conceptoTipo}
                    onValueChange={(value) => handleChange("conceptoTipo", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(conceptoTipoConfig).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moneda">Moneda</Label>
                  <Select
                    value={formData.moneda}
                    onValueChange={(value) => handleChange("moneda", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PES">Pesos Argentinos</SelectItem>
                      <SelectItem value="DOL">Dólares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="concepto">Descripción del Concepto *</Label>
                <Textarea
                  id="concepto"
                  value={formData.concepto}
                  onChange={(e) => handleChange("concepto", e.target.value)}
                  placeholder="Descripción de los servicios o productos..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {formData.conceptoTipo !== "1" && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Período del Servicio</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodoDesde">Desde</Label>
                  <Input
                    id="periodoDesde"
                    type="date"
                    value={formData.periodoDesde}
                    onChange={(e) => handleChange("periodoDesde", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodoHasta">Hasta</Label>
                  <Input
                    id="periodoHasta"
                    type="date"
                    value={formData.periodoHasta}
                    onChange={(e) => handleChange("periodoHasta", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vencimientoPago">Vencimiento Pago</Label>
                  <Input
                    id="vencimientoPago"
                    type="date"
                    value={formData.vencimientoPago}
                    onChange={(e) =>
                      handleChange("vencimientoPago", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={onCreate}
            disabled={
              creating ||
              !formData.receptorNombre ||
              !formData.importeNeto ||
              !formData.importeTotal ||
              !formData.concepto
            }
          >
            {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Crear Factura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
