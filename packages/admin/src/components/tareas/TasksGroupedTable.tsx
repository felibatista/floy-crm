"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Task, statusMap } from "./types";

interface TasksGroupedTableProps {
  tasks: Task[];
  loading: boolean;
  groupBy: string[];
}

type GroupNode = {
  key: string;
  label: string;
  tasks?: Task[];
  children?: Map<string, GroupNode>;
  count: number;
};

function getPriorityBars(priority: string) {
  const priorityLevels = {
    low: 1,
    medium: 2,
    high: 3,
    urgent: 4,
  };

  const level = priorityLevels[priority as keyof typeof priorityLevels] || 0;

  const getBarColor = (barIndex: number) => {
    if (barIndex > level) return "bg-muted";
    if (level === 1) return "bg-gray-500";
    if (level === 2) return "bg-yellow-500";
    if (level === 3) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-end gap-0.5 h-3">
      {[1, 2, 3, 4].map((barIndex) => (
        <div
          key={barIndex}
          className={`w-0.5 rounded-sm transition-colors ${getBarColor(
            barIndex
          )}`}
          style={{ height: `${barIndex * 25}%` }}
        />
      ))}
    </div>
  );
}

function getStatusBadge(status: string) {
  const info = statusMap[status] || {
    variant: "outline" as const,
    label: status,
  };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

function getGroupValue(task: Task, groupType: string): string {
  switch (groupType) {
    case "client":
      return task.project.client.name || "Sin cliente";
    case "project":
      return task.project.name;
    case "status":
      return task.status;
    case "priority":
      return task.priority;
    default:
      return "Otros";
  }
}

function getGroupLabel(groupValue: string, groupType: string): string {
  if (groupType === "status") {
    return statusMap[groupValue]?.label || groupValue;
  }
  if (groupType === "priority") {
    const priorityLabels: Record<string, string> = {
      low: "Baja",
      medium: "Media",
      high: "Alta",
      urgent: "Urgente",
    };
    return priorityLabels[groupValue] || groupValue;
  }
  return groupValue;
}

function sortGroupKeys(keys: string[], groupType: string): string[] {
  if (groupType === "priority") {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return keys.sort((a, b) => {
      return (
        (priorityOrder[a as keyof typeof priorityOrder] ?? 999) -
        (priorityOrder[b as keyof typeof priorityOrder] ?? 999)
      );
    });
  }
  return keys.sort();
}

function TaskRow({ task }: { task: Task }) {
  const router = useRouter();

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => router.push(`/dashboard/tareas/${task.code}`)}
    >
      <TableCell className="font-mono whitespace-nowrap">{task.code}</TableCell>
      <TableCell>{task.project.name}</TableCell>
      <TableCell>{task.title}</TableCell>
      <TableCell>{getStatusBadge(task.status)}</TableCell>
      <TableCell className="text-muted-foreground">
        {task.assignedTo?.name || "-"}
      </TableCell>
      <TableCell>{getPriorityBars(task.priority)}</TableCell>
    </TableRow>
  );
}

function GroupRow({
  node,
  groupType,
  level,
  expandedGroups,
  toggleGroup,
  groupPath,
}: {
  node: GroupNode;
  groupType: string;
  level: number;
  expandedGroups: Set<string>;
  toggleGroup: (path: string) => void;
  groupPath: string;
}) {
  const isExpanded = expandedGroups.has(groupPath);
  const hasChildren = node.children && node.children.size > 0;
  const hasTasks = node.tasks && node.tasks.length > 0;

  return (
    <>
      <TableRow
        className="bg-muted/50 hover:bg-muted cursor-pointer font-medium"
        onClick={() => toggleGroup(groupPath)}
      >
        <TableCell colSpan={6}>
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${level * 1}rem` }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>
              {node.label} ({node.count})
            </span>
          </div>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <>
          {hasChildren &&
            Array.from(node.children!.entries()).map(([key, childNode]) => (
              <GroupRow
                key={key}
                node={childNode}
                groupType={groupType}
                level={level + 1}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                groupPath={`${groupPath}/${key}`}
              />
            ))}
          {hasTasks &&
            node.tasks!.map((task) => <TaskRow key={task.id} task={task} />)}
        </>
      )}
    </>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-48" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function TasksGroupedTable({
  tasks,
  loading,
  groupBy,
}: TasksGroupedTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set()
  );

  const groupTree = useMemo(() => {
    if (groupBy.length === 0) return null;

    function buildTree(
      tasks: Task[],
      groupLevels: string[],
      levelIndex: number = 0
    ): Map<string, GroupNode> {
      if (levelIndex >= groupLevels.length) {
        return new Map();
      }

      const currentGroupType = groupLevels[levelIndex];
      const isLastLevel = levelIndex === groupLevels.length - 1;
      const groups = new Map<string, GroupNode>();

      tasks.forEach((task) => {
        const groupValue = getGroupValue(task, currentGroupType);
        const groupLabel = getGroupLabel(groupValue, currentGroupType);

        if (!groups.has(groupValue)) {
          groups.set(groupValue, {
            key: groupValue,
            label: groupLabel,
            tasks: isLastLevel ? [] : undefined,
            children: isLastLevel ? undefined : new Map(),
            count: 0,
          });
        }

        const node = groups.get(groupValue)!;
        node.count++;

        if (isLastLevel) {
          node.tasks!.push(task);
        } else {
          // Construir el siguiente nivel recursivamente
          const nextLevelGroups = buildTree(
            [task],
            groupLevels,
            levelIndex + 1
          );
          nextLevelGroups.forEach((childNode, childKey) => {
            if (node.children!.has(childKey)) {
              const existingChild = node.children!.get(childKey)!;
              existingChild.count += childNode.count;
              if (childNode.tasks) {
                existingChild.tasks!.push(...childNode.tasks);
              }
              if (childNode.children) {
                childNode.children.forEach((grandChild, grandKey) => {
                  if (existingChild.children!.has(grandKey)) {
                    // Merge recursivamente si es necesario
                    const existingGrand = existingChild.children!.get(grandKey)!;
                    existingGrand.count += grandChild.count;
                    if (grandChild.tasks) {
                      existingGrand.tasks!.push(...grandChild.tasks);
                    }
                  } else {
                    existingChild.children!.set(grandKey, grandChild);
                  }
                });
              }
            } else {
              node.children!.set(childKey, childNode);
            }
          });
        }
      });

      return groups;
    }

    const tree = buildTree(tasks, groupBy);

    // Ordenar las claves en cada nivel
    const sortedTree = new Map(
      sortGroupKeys(Array.from(tree.keys()), groupBy[0]).map((key) => [
        key,
        tree.get(key)!,
      ])
    );

    return sortedTree;
  }, [tasks, groupBy]);

  const toggleGroup = (groupPath: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupPath)) {
        newSet.delete(groupPath);
      } else {
        newSet.add(groupPath);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="border-t flex-1 overflow-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Asignado</TableHead>
              <TableHead>Prioridad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeleton />
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!groupTree || groupBy.length === 0) {
    return null;
  }

  if (tasks.length === 0) {
    return (
      <div className="border-t flex-1 overflow-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Asignado</TableHead>
              <TableHead>Prioridad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                No hay tareas
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border-t flex-1 overflow-auto">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Código</TableHead>
            <TableHead>Proyecto</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asignado</TableHead>
            <TableHead>Prioridad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from(groupTree.entries()).map(([key, node]) => (
            <GroupRow
              key={key}
              node={node}
              groupType={groupBy[0]}
              level={0}
              expandedGroups={expandedGroups}
              toggleGroup={toggleGroup}
              groupPath={key}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
