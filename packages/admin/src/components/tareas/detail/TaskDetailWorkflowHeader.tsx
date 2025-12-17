"use client";

import { useRef } from "react";
import confetti from "canvas-confetti";
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
  const completedBadgeRef = useRef<HTMLDivElement>(null);

  const triggerConfetti = () => {
    if (!completedBadgeRef.current) return;

    const rect = completedBadgeRef.current.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top - 50 +rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      angle: 230,
      gravity: 0.2,
      colors: ["#22c55e", "#16a34a", "#15803d", "#facc15", "#fbbf24"],
    });
  };

  const handleStatusClick = (stepKey: string, isDisabled: boolean) => {
    if (isDisabled) return;

    if (stepKey === "completed" && currentStatus !== "completed") {
      triggerConfetti();
    }

    onStatusChange(stepKey);
  };

  return (
    <div className="flex items-center gap-1">
      {workflowSteps.map((step, index) => {
        const isDisabled = step.key === "draft" && currentStatus !== "draft";
        const isCompleted = step.key === "completed";

        return (
          <div
            key={step.key}
            className="flex items-center gap-1"
            ref={isCompleted ? completedBadgeRef : undefined}
          >
            {index > 0 && <span className="text-muted-foreground mx-1">→</span>}
            <Badge
              variant={currentStatus === step.key ? "blue" : "outline"}
              className={`whitespace-nowrap transition-all ${
                currentStatus === step.key ? "ring-1 ring-blue-300" : ""
              } ${
                isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={() => handleStatusClick(step.key, isDisabled)}
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
