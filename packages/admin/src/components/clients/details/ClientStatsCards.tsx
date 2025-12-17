import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Ticket, Globe } from "lucide-react";

interface ClientStatsCardsProps {
  projectsCount?: number;
  ticketsCount?: number;
  isPortalEnabled?: boolean;
}

const ClientStatsCards = ({
  projectsCount = 0,
  ticketsCount = 0,
  isPortalEnabled = false,
}: ClientStatsCardsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{projectsCount}</p>
              <p className="text-xs text-muted-foreground">Proyectos</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{ticketsCount}</p>
              <p className="text-xs text-muted-foreground">Tickets</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">
                {isPortalEnabled ? "Sí" : "No"}
              </p>
              <p className="text-xs text-muted-foreground">Portal</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientStatsCards;
