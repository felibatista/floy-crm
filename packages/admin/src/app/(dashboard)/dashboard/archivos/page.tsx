"use client";

import { useEffect } from "react";

export default function ArchivosPage() {
  useEffect(() => {
    document.title = "Archivos | Acentus";
  }, []);

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Archivos</h1>
      <p className="text-muted-foreground">Gestión de archivos y adjuntos.</p>
    </div>
  );
}
