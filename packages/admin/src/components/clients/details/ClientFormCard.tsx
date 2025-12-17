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
import { ClientDetailFormData } from "./types";

interface ClientFormCardProps {
  formData: ClientDetailFormData;
  onFormDataChange: (data: ClientDetailFormData) => void;
}

const ClientFormCard = ({
  formData,
  onFormDataChange,
}: ClientFormCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del cliente</CardTitle>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                onFormDataChange({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                onFormDataChange({ ...formData, phone: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) =>
              onFormDataChange({ ...formData, company: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) =>
              onFormDataChange({ ...formData, address: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (subdominio) *</Label>
            <Input id="slug" value={formData.slug} disabled />
          </div>

          <div className="space-y-2">
            <Label>Portal habilitado</Label>
            <Select
              value={formData.isPortalEnabled ? "yes" : "no"}
              onValueChange={(v) =>
                onFormDataChange({ ...formData, isPortalEnabled: v === "yes" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Sí</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientFormCard;
