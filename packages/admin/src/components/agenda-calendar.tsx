"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PlusIcon, Trash2, Clock, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DayButton } from "react-day-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: number;
  name: string;
  email: string;
}

interface CalendarEvent {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  date: string;
  isAllDay: boolean;
  startTime: string | null;
  endTime: string | null;
  user: User;
}

function formatTimeRange(event: CalendarEvent): string {
  if (event.isAllDay) {
    return "Todo el día";
  }
  if (event.startTime && event.endTime) {
    return `${event.startTime} - ${event.endTime}`;
  }
  if (event.startTime) {
    return `Desde ${event.startTime}`;
  }
  return "";
}

interface CustomDayButtonProps extends React.ComponentProps<typeof DayButton> {
  eventCount: number;
}

function CustomDayButton({
  eventCount,
  day,
  ...props
}: CustomDayButtonProps) {
  return (
    <CalendarDayButton day={day} {...props}>
      <span>{day.date.getDate()}</span>
      {eventCount > 0 && (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-300 text-[0.5rem] text-black font-semibold">
          {eventCount}
        </span>
      )}
    </CalendarDayButton>
  );
}

export function AgendaCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedUserId, setSelectedUserId] = React.useState<string>("all");
  const [showOnlyMine, setShowOnlyMine] = React.useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isAllDay, setIsAllDay] = React.useState(true);
  const [eventTitle, setEventTitle] = React.useState("");
  const [eventDescription, setEventDescription] = React.useState("");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("10:00");
  const [saving, setSaving] = React.useState(false);

  const fetchEvents = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const params = new URLSearchParams();

      if (showOnlyMine) {
        params.append("onlyMine", "true");
      } else if (selectedUserId !== "all") {
        params.append("userId", selectedUserId);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/calendar/events?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [showOnlyMine, selectedUserId]);

  const fetchUsers = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, [fetchEvents, fetchUsers]);

  const eventsForSelectedDate = React.useMemo(() => {
    if (!date) return [];
    const dateKey = format(date, "yyyy-MM-dd");
    return events.filter((event) => {
      // Handle date string that might be "2024-12-16T00:00:00.000Z" or "2024-12-16"
      const eventDateStr = event.date.split("T")[0];
      return eventDateStr === dateKey;
    });
  }, [events, date]);

  const datesWithEvents = React.useMemo(() => {
    const dates: Date[] = [];
    const seen = new Set<string>();

    for (const event of events) {
      // Handle date string that might be "2024-12-16T00:00:00.000Z" or "2024-12-16"
      const dateKey = event.date.split("T")[0];
      if (!seen.has(dateKey)) {
        seen.add(dateKey);
        // Parse date parts to avoid timezone issues
        const [year, month, day] = dateKey.split("-").map(Number);
        dates.push(new Date(year, month - 1, day));
      }
    }
    return dates;
  }, [events]);

  const eventCountByDate = React.useMemo(() => {
    const countMap = new Map<string, number>();

    for (const event of events) {
      const dateKey = event.date.split("T")[0];
      countMap.set(dateKey, (countMap.get(dateKey) || 0) + 1);
    }

    return countMap;
  }, [events]);

  const handleDayClick = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const handleAddEvent = () => {
    setEventTitle("");
    setEventDescription("");
    setIsAllDay(true);
    setStartTime("09:00");
    setEndTime("10:00");
    setIsModalOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventTitle.trim() || !date) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/calendar/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: eventTitle.trim(),
            description: eventDescription.trim() || null,
            date: format(date, "yyyy-MM-dd"),
            isAllDay,
            startTime: isAllDay ? null : startTime,
            endTime: isAllDay ? null : endTime,
          }),
        }
      );

      if (res.ok) {
        const newEvent = await res.json();
        setEvents((prev) => [...prev, newEvent]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("¿Eliminar este evento?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/calendar/events/${eventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  if (loading) {
    return (
      <Card className="h-[50vh] py-4">
        <CardContent className="flex h-full gap-6 px-4">
          <Skeleton className="h-full flex-1" />
          <Skeleton className="h-full w-[280px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="py-4 max-w-4xl w-full">
        <CardContent className="grid grid-cols-4 h-full gap-6 px-4 pb-0">
          {/* Calendario a la izquierda */}
          <div className="flex flex-col col-span-2">
            {/* Filtros */}
            <div className="flex items-center gap-2 mb-4">
              <Select
                value={showOnlyMine ? "mine" : selectedUserId}
                onValueChange={(value) => {
                  if (value === "mine") {
                    setShowOnlyMine(true);
                    setSelectedUserId("all");
                  } else {
                    setShowOnlyMine(false);
                    setSelectedUserId(value);
                  }
                }}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Filtrar por usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mine">Solo mis eventos</SelectItem>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDayClick}
              className="bg-transparent w-full p-0 [--cell-size:--spacing(4)] md:[--cell-size:--spacing(5)]"
              locale={es}
              modifiers={{
                hasEvents: datesWithEvents,
              }}
              modifiersStyles={{
                hasEvents: {
                  fontWeight: "bold",
                },
              }}
              components={{
                DayButton: (props) => {
                  const dateKey = format(props.day.date, "yyyy-MM-dd");
                  const eventCount = eventCountByDate.get(dateKey) || 0;
                  return <CustomDayButton {...props} eventCount={eventCount} />;
                },
              }}
            />
          </div>

          {/* Eventos a la derecha */}
          <div className="flex-1 flex flex-col border-l pl-6 col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">
                {date?.toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                title="Agregar Evento"
                onClick={handleAddEvent}
              >
                <PlusIcon className="h-4 w-4" />
                <span className="sr-only">Agregar Evento</span>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-2 pr-2">
                {eventsForSelectedDate.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No hay eventos para este día
                  </p>
                ) : (
                  eventsForSelectedDate.map((event) => (
                    <div
                      key={event.id}
                      className="bg-muted after:bg-green-300 relative rounded-md p-2 pl-6 text-xs after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-muted-foreground flex items-center gap-1">
                            {event.isAllDay ? (
                              <CalendarDays className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {formatTimeRange(event)}
                          </div>
                          {!showOnlyMine && selectedUserId === "all" && (
                            <div className="text-muted-foreground mt-1">
                              {event.user.name}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal para crear evento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nuevo evento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span className="font-medium">
                  {date?.toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-title">Título</Label>
              <Input
                id="event-title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Ej: Reunión con cliente"
              />
            </div>

            <div className="grid gap-2">
              <Label>Horario</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timeType"
                    checked={isAllDay}
                    onChange={() => setIsAllDay(true)}
                    className="h-4 w-4"
                  />
                  <span className="text-xs">Todo el día</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timeType"
                    checked={!isAllDay}
                    onChange={() => setIsAllDay(false)}
                    className="h-4 w-4"
                  />
                  <span className="text-xs">Horario específico</span>
                </label>
              </div>
            </div>

            {!isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-time">Desde</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-time">Hasta</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEvent}
              disabled={saving || !eventTitle.trim()}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
