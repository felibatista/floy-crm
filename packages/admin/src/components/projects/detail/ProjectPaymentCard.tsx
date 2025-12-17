import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectDetailFormData } from "./types";

interface ProjectPaymentCardProps {
  formData: ProjectDetailFormData;
  onFormDataChange: (data: ProjectDetailFormData) => void;
}

function formatCurrency(amount: string, currency: string): string {
  if (!amount) return "-";
  const num = parseFloat(amount);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency || "ARS",
  }).format(num);
}

function getPaymentProgress(totalAmount: string, paidAmount: string): number {
  if (!totalAmount) return 0;
  const total = parseFloat(totalAmount);
  const paid = parseFloat(paidAmount || "0");
  if (isNaN(total) || total === 0) return 0;
  return Math.min((paid / total) * 100, 100);
}

function getRemainingAmount(totalAmount: string, paidAmount: string): number {
  const total = parseFloat(totalAmount || "0");
  const paid = parseFloat(paidAmount || "0");
  if (isNaN(total) || isNaN(paid)) return 0;
  return Math.max(total - paid, 0);
}

const ProjectPaymentCard = ({
  formData,
  onFormDataChange,
}: ProjectPaymentCardProps) => {
  const progress = getPaymentProgress(formData.totalAmount, formData.paidAmount);
  const remaining = getRemainingAmount(formData.totalAmount, formData.paidAmount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.totalAmount && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso de pago</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pagado: {formatCurrency(formData.paidAmount, formData.currency)}</span>
              <span>Restante: {formatCurrency(remaining.toString(), formData.currency)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Monto total</Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.totalAmount}
              onChange={(e) =>
                onFormDataChange({ ...formData, totalAmount: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAmount">Monto pagado</Label>
            <Input
              id="paidAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.paidAmount}
              onChange={(e) =>
                onFormDataChange({ ...formData, paidAmount: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Moneda</Label>
            <Select
              value={formData.currency}
              onValueChange={(v) =>
                onFormDataChange({ ...formData, currency: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                <SelectItem value="USD">USD - Dólar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDueDate">Fecha límite de pago</Label>
            <Input
              id="paymentDueDate"
              type="date"
              value={formData.paymentDueDate}
              onChange={(e) =>
                onFormDataChange({ ...formData, paymentDueDate: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectPaymentCard;
