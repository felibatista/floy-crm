"use client";

import * as React from "react";
import { format, parseISO, isAfter, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function UpcomingEvents() {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchUpcomingEvents = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/calendar/events?onlyMine=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data: CalendarEvent[] = await res.json();

        // Filtrar eventos futuros y ordenar por fecha
        const today = startOfDay(new Date());
        const upcomingEvents = data
          .filter((event) => {
            const eventDate = parseISO(event.date.split("T")[0]);
            return (
              isAfter(eventDate, today) ||
              eventDate.getTime() === today.getTime()
            );
          })
          .sort((a, b) => {
            const dateA = parseISO(a.date.split("T")[0]);
            const dateB = parseISO(b.date.split("T")[0]);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA.getTime() - dateB.getTime();
            }
            // Si las fechas son iguales, ordenar por hora
            if (a.startTime && b.startTime) {
              return a.startTime.localeCompare(b.startTime);
            }
            return 0;
          })
          .slice(0, 4);

        setEvents(upcomingEvents);
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              No hay eventos próximos programados
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {events.map((event) => {
          const eventDate = parseISO(event.date.split("T")[0]);
          const formattedDate = format(eventDate, "EEEE, d 'de' MMMM", {
            locale: es,
          });
          const dayNumber = format(eventDate, "d");
          const monthName = format(eventDate, "MMM", { locale: es });

          return (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-3 min-w-[60px]">
                    <span className="text-2xl font-bold text-primary">
                      {dayNumber}
                    </span>
                    <span className="text-xs text-primary uppercase">
                      {monthName}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2">
                      {event.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {event.isAllDay ? (
                    <CalendarDays className="h-4 w-4 shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate">{formatTimeRange(event)}</span>
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
