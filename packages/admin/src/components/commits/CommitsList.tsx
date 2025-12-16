"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { GitCommit, ExternalLink, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export interface Commit {
  id: number;
  hash: string;
  message: string;
  author: string;
  url: string | null;
  committedAt: string;
  repository: string;
}

interface CommitsListProps {
  taskId: number;
}

export function CommitsList({ taskId }: CommitsListProps) {
  const [commits, setCommits] = React.useState<Commit[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCommits = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/github/commits/task/${taskId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setCommits(data);
        }
      } catch (error) {
        console.error("Error fetching commits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [taskId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="text-center py-8">
        <GitCommit className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No hay commits asociados a esta tarea
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Los commits se vinculan automáticamente cuando contienen el código de la tarea en el mensaje
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Hash</TableHead>
            <TableHead>Mensaje</TableHead>
            <TableHead className="w-[150px]">Autor</TableHead>
            <TableHead className="w-[180px]">Repositorio</TableHead>
            <TableHead className="w-[120px]">Fecha</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commits.map((commit) => (
            <TableRow key={commit.id}>
              <TableCell className="font-mono text-xs">
                {commit.hash.slice(0, 7)}
              </TableCell>
              <TableCell className="text-xs max-w-[300px] truncate">
                {commit.message}
              </TableCell>
              <TableCell className="text-xs">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  {commit.author}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {commit.repository}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {format(new Date(commit.committedAt), "dd MMM yyyy HH:mm", {
                  locale: es,
                })}
              </TableCell>
              <TableCell>
                {commit.url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    asChild
                  >
                    <a
                      href={commit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
