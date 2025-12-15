"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AgendaEvent = {
  id: string;
  dateKey: string; // yyyy-MM-dd
  title: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  createdAt: number;
};

type AgendaState = {
  version: 1;
  events: AgendaEvent[];
};

const STORAGE_KEY = "floy.admin.agenda.v1";

function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function safeParse(raw: string | null): AgendaState {
  if (!raw) return { version: 1, events: [] };
  try {
    const parsed = JSON.parse(raw) as Partial<AgendaState>;
    if (parsed && parsed.version === 1 && Array.isArray(parsed.events)) {
      return { version: 1, events: parsed.events as AgendaEvent[] };
    }
  } catch {
    // ignore
  }
  return { version: 1, events: [] };
}

export function MegaAgenda() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    () => new Date()
  );
  const [state, setState] = React.useState<AgendaState>({
    version: 1,
    events: [],
  });

  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    const loaded = safeParse(
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null
    );
    setState(loaded);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const dateKey = React.useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const eventsForDay = React.useMemo(() => {
    return state.events
      .filter((e) => e.dateKey === dateKey)
      .sort((a, b) => {
        const aKey = `${a.startTime ?? ""}`;
        const bKey = `${b.startTime ?? ""}`;
        if (aKey !== bKey) return aKey.localeCompare(bKey);
        return a.createdAt - b.createdAt;
      });
  }, [state.events, dateKey]);

  const daysWithEvents = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const e of state.events) {
      map.set(e.dateKey, (map.get(e.dateKey) ?? 0) + 1);
    }
    return map;
  }, [state.events]);

  const modifiers = React.useMemo(() => {
    // react-day-picker accepts an array of dates
    const markedDates: Date[] = [];
    for (const key of Array.from(daysWithEvents.keys())) {
      // key is yyyy-MM-dd
      const [y, m, d] = key.split("-").map((v: string) => Number(v));
      if (!y || !m || !d) continue;
      markedDates.push(new Date(y, m - 1, d));
    }
    return { hasEvents: markedDates };
  }, [daysWithEvents]);

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const next: AgendaEvent = {
      id: crypto.randomUUID(),
      dateKey,
      title: trimmed,
      startTime: startTime.trim() || undefined,
      endTime: endTime.trim() || undefined,
      description: description.trim() || undefined,
      createdAt: Date.now(),
    };

    setState((prev) => ({ ...prev, events: [next, ...prev.events] }));
    setTitle("");
    setStartTime("");
    setEndTime("");
    setDescription("");
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  };

  return (
    <Card className="min-h-[70vh]">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-sm">Agenda</CardTitle>
          <p className="text-xs text-muted-foreground">
            Seleccioná un día y cargá eventos para esa fecha.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Nuevo evento</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Fecha</Label>
                <div className="flex items-center gap-2 text-xs">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(selectedDate, "PPP")}
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="agenda-title">Título</Label>
                <Input
                  id="agenda-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Reunión con cliente"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="agenda-start">Inicio (opcional)</Label>
                  <Input
                    id="agenda-start"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="09:00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="agenda-end">Fin (opcional)</Label>
                  <Input
                    id="agenda-end"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="10:00"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="agenda-desc">Descripción (opcional)</Label>
                <Textarea
                  id="agenda-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notas del evento..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!title.trim()}>
                Crear
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-lg border p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className="w-full"
              modifiers={modifiers}
              modifiersClassNames={{
                hasEvents: "font-semibold",
              }}
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Días con eventos aparecen resaltados.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">
                  {format(selectedDate, "PPP")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {eventsForDay.length} evento(s)
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {eventsForDay.length ? (
                eventsForDay.map((e) => (
                  <div key={e.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {(e.startTime || e.endTime) && (
                            <span className="text-xs text-muted-foreground">
                              {e.startTime ?? ""}
                              {e.endTime ? `–${e.endTime}` : ""}
                            </span>
                          )}
                          <p className="truncate font-medium">{e.title}</p>
                        </div>
                        {e.description ? (
                          <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                            {e.description}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(e.id)}
                        aria-label="Eliminar evento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed p-6 text-xs text-muted-foreground">
                  No hay eventos para este día. Creá uno con “Nuevo evento”.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
