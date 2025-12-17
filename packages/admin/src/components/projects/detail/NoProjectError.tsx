"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FolderX } from "lucide-react";

const NoProjectError = () => {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
      <FolderX className="h-12 w-12 mb-4" />
      <h2 className="text-lg font-medium">Proyecto no encontrado</h2>
      <p className="text-sm mb-4">El proyecto que buscas no existe o fue eliminado.</p>
      <Button variant="outline" onClick={() => router.push("/dashboard/proyectos")}>
        Volver a proyectos
      </Button>
    </div>
  );
};

export default NoProjectError;
