"use client";

import { useEffect } from "react";
import { AgendaCalendar } from "@/components/agenda-calendar";
import { UpcomingEvents } from "@/components/upcoming-events";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  useEffect(() => {
    document.title = "Dashboard | Acentus";
  }, []);

  const { user } = useAuth();

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          🎄 Bienvenido {user?.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Hoy es{" "}
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <AgendaCalendar />
      <UpcomingEvents />
    </div>
  );
}
