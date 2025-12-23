"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Check } from "lucide-react";

interface ContactLinkDialogProps {
  jid: string;
  currentName?: string;
  onContactUpdated?: () => void;
}

interface Contact {
  id: number;
  jid: string;
  name: string;
  company?: string;
  notes?: string;
}

export function ContactLinkDialog({ jid, currentName, onContactUpdated }: ContactLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: currentName || "",
    company: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("admin_token");

  const fetchContact = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/contacts/${encodeURIComponent(jid)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setContact(data);
          setFormData({
            name: data.name,
            company: data.company || "",
            notes: data.notes || "",
          });
        } else {
          // No hay contacto guardado, usar el nombre actual de WhatsApp
          setContact(null);
          setFormData({
            name: currentName || "",
            company: "",
            notes: "",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching contact:", err);
      setContact(null);
      setFormData({
        name: currentName || "",
        company: "",
        notes: "",
      });
    }
  };

  // Fetch contact info when component mounts or jid changes
  useEffect(() => {
    fetchContact();
  }, [jid]);

  useEffect(() => {
    if (open) {
      fetchContact();
    } else {
      // Reset form cuando se cierra
      setFormData({
        name: currentName || "",
        company: "",
        notes: "",
      });
    }
  }, [open]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("El nombre es requerido");
      return;
    }

    try {
      setLoading(true);
      const token = getToken();

      const method = contact ? "PUT" : "POST";
      const url = contact
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/contacts/${encodeURIComponent(jid)}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/contacts`;

      const body = contact
        ? formData
        : { jid, ...formData };

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setContact(data);
        setOpen(false);
        onContactUpdated?.();
      } else {
        const error = await res.json();
        alert(error.error || "Error al guardar contacto");
      }
    } catch (err: any) {
      console.error("Error saving contact:", err);
      alert("Error al guardar contacto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={contact ? "Contacto vinculado" : "Vincular contacto"}
        >
          {contact ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <UserPlus className="h-5 w-5" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {contact ? "Editar Contacto" : "Vincular Contacto"}
          </DialogTitle>
          <DialogDescription>
            Agrega información adicional sobre este contacto para mejorar las
            respuestas generadas por IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nombre del contacto"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="Nombre de la empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Notas adicionales sobre el contacto..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
