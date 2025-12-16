"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  WorkLog,
  WorkLogFormData,
  WorkLogType,
  workLogTypeOptions,
  initialWorkLogFormData,
} from "./types";

interface WorkLogModalProps {
  taskId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (workLog: WorkLog) => void;
}

export function WorkLogModal({
  taskId,
  open,
  onOpenChange,
  onSuccess,
}: WorkLogModalProps) {
  const [formData, setFormData] = useState<WorkLogFormData>({
    ...initialWorkLogFormData,
    dateWorked: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      ...initialWorkLogFormData,
      dateWorked: new Date().toISOString().split("T")[0],
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.summary.trim()) {
      setError("El resumen es requerido");
      return;
    }

    const hours = parseInt(formData.hours) || 0;
    const minutes = parseInt(formData.minutes) || 0;

    if (hours === 0 && minutes === 0) {
      setError("Debes ingresar al menos algún tiempo");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/worklogs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId,
            summary: formData.summary,
            hours,
            minutes,
            type: formData.type,
            dateWorked: formData.dateWorked,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el trabajo");
      }

      const newWorkLog = await res.json();
      resetForm();
      onOpenChange(false);
      onSuccess(newWorkLog);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar trabajo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="summary">Resumen del trabajo</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, summary: e.target.value }))
              }
              placeholder="Describe qué trabajo realizaste..."
              className="mt-1.5 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de trabajo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: WorkLogType) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workLogTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateWorked">Fecha</Label>
              <Input
                id="dateWorked"
                type="date"
                value={formData.dateWorked}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dateWorked: e.target.value }))
                }
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>Tiempo dedicado</Label>
            <div className="flex gap-3 items-center mt-1.5">
              <div className="flex items-center gap-2">
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="24"
                  value={formData.hours}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, hours: e.target.value }))
                  }
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">horas</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={formData.minutes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, minutes: e.target.value }))
                  }
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
