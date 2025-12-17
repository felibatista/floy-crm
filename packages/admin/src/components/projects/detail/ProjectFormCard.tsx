import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ProjectDetailFormData } from "./types";
import { statusConfig, ProjectStatus } from "../types";

interface ProjectFormCardProps {
  formData: ProjectDetailFormData;
  onFormDataChange: (data: ProjectDetailFormData) => void;
}

const ProjectFormCard = ({
  formData,
  onFormDataChange,
}: ProjectFormCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del proyecto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              onFormDataChange({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(v) =>
                onFormDataChange({ ...formData, status: v as ProjectStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(statusConfig) as ProjectStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusConfig[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubRepo">Repositorio GitHub</Label>
            <Input
              id="githubRepo"
              placeholder="owner/repo"
              value={formData.githubRepo}
              onChange={(e) =>
                onFormDataChange({ ...formData, githubRepo: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha inicio</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                onFormDataChange({ ...formData, startDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha fin</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                onFormDataChange({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectFormCard;
