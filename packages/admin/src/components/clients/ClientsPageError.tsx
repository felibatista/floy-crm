import { ArrowUpRightIcon, ServerCrash } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ClientsErrorPage = () => {
  const router = useRouter();
  return (
    <Empty className="h-full flex flex-col justify-center items-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ServerCrash />
        </EmptyMedia>
        <EmptyTitle>Error al cargar los clientes</EmptyTitle>
        <EmptyDescription>
          Hubo un problema al cargar los clientes. Por favor, intenta de nuevo
          más tarde.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/dashboard")}>
            Ir al inicio
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
};

export default ClientsErrorPage;
