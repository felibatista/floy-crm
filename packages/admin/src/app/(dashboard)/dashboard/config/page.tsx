"use client";

import { useEffect } from "react";

export default function ConfigPage() {
  useEffect(() => {
    document.title = "Configuración | Acentus";
  }, []);

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Config</h1>
      <p className="text-muted-foreground">
        Preferencias y configuración del sistema.
      </p>
    </div>
  );
}
