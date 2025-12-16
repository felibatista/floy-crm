"use client";

import { Badge } from "@/components/ui/badge";

interface WorkflowStep {
  key: string;
  label: string;
}

interface TaskDetailWorkflowHeaderProps {
  currentStatus: string;
  workflowSteps: WorkflowStep[];
  onStatusChange: (status: string) => void;
}

export function TaskDetailWorkflowHeader({
  currentStatus,
  workflowSteps,
  onStatusChange,
}: TaskDetailWorkflowHeaderProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {workflowSteps.map((step, index) => {
        const isDisabled = step.key === "draft" && currentStatus !== "draft";
        return (
          <div key={step.key} className="flex items-center gap-1">
            {index > 0 && <span className="text-muted-foreground mx-1">→</span>}
            <Badge
              variant={currentStatus === step.key ? "blue" : "outline"}
              className={`whitespace-nowrap transition-all ${
                currentStatus === step.key ? "ring-2 ring-blue-300" : ""
              } ${
                isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={() => !isDisabled && onStatusChange(step.key)}
            >
              {step.label}
            </Badge>
          </div>
        );
      })}
      <span className="text-muted-foreground mx-1">|</span>
      <Badge
        variant={currentStatus === "cancelled" ? "destructive" : "outline"}
        className={`cursor-pointer whitespace-nowrap transition-all ${
          currentStatus === "cancelled" && "ring-2 ring-red-300"
        }`}
        onClick={() => onStatusChange("cancelled")}
      >
        Cancelada
      </Badge>
    </div>
  );
}
