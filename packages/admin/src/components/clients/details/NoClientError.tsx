import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ArrowLeft, ServerCrash } from "lucide-react";
import { useRouter } from "next/navigation";

const NoClientError = () => {
  const router = useRouter();

  return (
    <Empty className="h-full flex flex-col justify-center items-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ServerCrash />
        </EmptyMedia>
        <EmptyTitle>Error al carga el cliente</EmptyTitle>
        <EmptyDescription>
          Hubo un problema al cargar el cliente. Por favor, intenta de nuevo más
          tarde.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/dashboard/clientes")}>
            Volver a clientes
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
};

export default NoClientError;
