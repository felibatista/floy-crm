"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ClientFormData } from "./types";

interface ClientCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ClientFormData;
  onFormChange: (data: ClientFormData) => void;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  creating: boolean;
}

export function ClientCreateDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onNameChange,
  onCreate,
  creating,
}: ClientCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear nuevo cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Nombre del cliente"
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
                  onFormChange({ ...formData, email: e.target.value })
                }
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  onFormChange({ ...formData, phone: e.target.value })
                }
                placeholder="+54 11 1234-5678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                onFormChange({ ...formData, company: e.target.value })
              }
              placeholder="Nombre de la empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                onFormChange({ ...formData, address: e.target.value })
              }
              placeholder="Dirección completa"
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
                  onFormChange({
                    ...formData,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, ""),
                  })
                }
                placeholder="mi-cliente"
              />
              <p className="text-xs text-muted-foreground">
                {formData.slug}.tudominio.com
              </p>
            </div>

            <div className="space-y-2">
              <Label>Portal habilitado</Label>
              <Select
                value={formData.isPortalEnabled ? "yes" : "no"}
                onValueChange={(v) =>
                  onFormChange({ ...formData, isPortalEnabled: v === "yes" })
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button
              onClick={onCreate}
              disabled={creating || !formData.name || !formData.slug}
            >
              {creating ? "Creando..." : "Crear cliente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
