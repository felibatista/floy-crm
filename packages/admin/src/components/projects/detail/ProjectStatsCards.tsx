import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, Receipt, FileText, Building2 } from "lucide-react";

interface ProjectStatsCardsProps {
  clientName?: string;
  clientSlug?: string;
  tasksCount?: number;
  paymentsCount?: number;
  filesCount?: number;
}

const ProjectStatsCards = ({
  clientName,
  clientSlug,
  tasksCount = 0,
  paymentsCount = 0,
  filesCount = 0,
}: ProjectStatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cliente</span>
          </div>
          <p className="mt-1 font-medium text-sm">{clientName || "-"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Tareas</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{tasksCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Pagos</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{paymentsCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Archivos</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{filesCount}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectStatsCards;
