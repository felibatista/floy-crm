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
import { LeadFormData, LeadStatus } from "./types";

interface LeadCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: LeadFormData;
  onFormChange: (data: LeadFormData) => void;
  onCreate: () => void;
  creating: boolean;
}

export function LeadCreateDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onCreate,
  creating,
}: LeadCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear nuevo lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              placeholder="Nombre del lead"
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  onFormChange({ ...formData, status: v as LeadStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nuevo</SelectItem>
                  <SelectItem value="contacted">Contactado</SelectItem>
                  <SelectItem value="qualified">Calificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                onFormChange({ ...formData, notes: e.target.value })
              }
              placeholder="Notas adicionales sobre el lead..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={onCreate} disabled={creating || !formData.name}>
              {creating ? "Creando..." : "Crear lead"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
