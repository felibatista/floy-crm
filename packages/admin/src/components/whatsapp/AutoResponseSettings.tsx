"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponseType {
  id: number;
  name: string;
  example: string;
}

interface Context {
  id: number;
  content: string;
}

export function AutoResponseSettings() {
  const [context, setContext] = useState<Context | null>(null);
  const [responseTypes, setResponseTypes] = useState<ResponseType[]>([]);
  const [editingContext, setEditingContext] = useState(false);
  const [contextContent, setContextContent] = useState("");
  const [newType, setNewType] = useState({ name: "", example: "" });
  const [editingType, setEditingType] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem("admin_token");

  const fetchContext = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/context`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setContext(data);
        setContextContent(data?.content || "");
      }
    } catch (err) {
      console.error("Error fetching context:", err);
    }
  };

  const fetchResponseTypes = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/response-types`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setResponseTypes(data);
      }
    } catch (err) {
      console.error("Error fetching response types:", err);
    }
  };

  useEffect(() => {
    fetchContext();
    fetchResponseTypes();
  }, []);

  const saveContext = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/context`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: contextContent }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setContext(data);
        setEditingContext(false);
      }
    } catch (err) {
      console.error("Error saving context:", err);
    } finally {
      setLoading(false);
    }
  };

  const createResponseType = async () => {
    if (!newType.name || !newType.example) return;

    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/response-types`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newType),
        }
      );
      if (res.ok) {
        setNewType({ name: "", example: "" });
        await fetchResponseTypes();
      }
    } catch (err) {
      console.error("Error creating response type:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateResponseType = async (id: number, data: { name: string; example: string }) => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/response-types/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) {
        setEditingType(null);
        await fetchResponseTypes();
      }
    } catch (err) {
      console.error("Error updating response type:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteResponseType = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este tipo de respuesta?")) return;

    try {
      setLoading(true);
      const token = getToken();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/auto-response/response-types/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchResponseTypes();
    } catch (err) {
      console.error("Error deleting response type:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Configurar IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración de Respuestas Automáticas</DialogTitle>
          <DialogDescription>
            Configura el contexto y los tipos de respuestas para generar respuestas con IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contexto General</CardTitle>
              <CardDescription>
                Describe cómo debe responder la IA, tono, estilo y reglas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingContext ? (
                <div className="space-y-3">
                  <Textarea
                    value={contextContent}
                    onChange={(e) => setContextContent(e.target.value)}
                    rows={6}
                    placeholder="Ej: Responde de manera profesional y amigable. Somos una empresa de desarrollo de software..."
                  />
                  <div className="flex gap-2">
                    <Button onClick={saveContext} disabled={loading} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingContext(false);
                        setContextContent(context?.content || "");
                      }}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {context?.content || "No hay contexto configurado"}
                  </p>
                  <Button variant="outline" onClick={() => setEditingContext(true)} size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipos de Respuestas</CardTitle>
              <CardDescription>
                Define ejemplos de respuestas típicas para guiar a la IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new type */}
              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Agregar Tipo de Respuesta</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Nombre (ej: Saludo inicial)"
                    value={newType.name}
                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  />
                  <Textarea
                    placeholder="Ejemplo de respuesta..."
                    value={newType.example}
                    onChange={(e) => setNewType({ ...newType, example: e.target.value })}
                    rows={3}
                  />
                  <Button
                    onClick={createResponseType}
                    disabled={loading || !newType.name || !newType.example}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Existing types */}
              <div className="space-y-3">
                {responseTypes.map((type) => (
                  <div key={type.id} className="border rounded-lg p-4">
                    {editingType === type.id ? (
                      <div className="space-y-2">
                        <Input
                          defaultValue={type.name}
                          id={`name-${type.id}`}
                        />
                        <Textarea
                          defaultValue={type.example}
                          rows={3}
                          id={`example-${type.id}`}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              const name = (document.getElementById(`name-${type.id}`) as HTMLInputElement)?.value;
                              const example = (document.getElementById(`example-${type.id}`) as HTMLTextAreaElement)?.value;
                              updateResponseType(type.id, { name, example });
                            }}
                            size="sm"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingType(null)}
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm">{type.name}</h5>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingType(type.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteResponseType(type.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {type.example}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
