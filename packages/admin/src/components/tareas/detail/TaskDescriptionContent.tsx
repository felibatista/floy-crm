"use client";

import { Textarea } from "@/components/ui/textarea";
import { Task } from "../types";

interface TaskDescriptionContentProps {
  task: Task | null;
  description: string;
  isDraft: boolean;
  onDescriptionChange: (value: string) => void;
}

export function TaskDescriptionContent({
  task,
  description,
  isDraft,
  onDescriptionChange,
}: TaskDescriptionContentProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <span>{task?.assignedTo?.name || "Sin asignar"}</span>
        <span>•</span>
        <span>
          {task?.createdAt && new Date(task.createdAt).toLocaleString("es-AR")}
        </span>
      </div>
      {isDraft ? (
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={8}
          placeholder="Descripción de la tarea..."
          className="bg-background"
        />
      ) : (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {description ? (
            <p className="whitespace-pre-wrap">{description}</p>
          ) : (
            <p className="text-muted-foreground italic">Sin descripción</p>
          )}
        </div>
      )}
    </div>
  );
}
