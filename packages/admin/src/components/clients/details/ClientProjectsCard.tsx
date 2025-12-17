"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderOpen, Github, Check, X, Pencil, Plus } from "lucide-react";
import { Project } from "./types";

interface ClientProjectsCardProps {
  clientName?: string;
  projects: Project[];
  onCreateProject: (
    name: string,
    description: string,
    githubRepo: string
  ) => Promise<void>;
  onSaveRepo: (projectId: number, githubRepo: string) => Promise<void>;
}

const ClientProjectsCard = ({
  clientName,
  projects,
  onCreateProject,
  onSaveRepo,
}: ClientProjectsCardProps) => {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectGithubRepo, setNewProjectGithubRepo] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingRepoValue, setEditingRepoValue] = useState("");
  const [savingRepo, setSavingRepo] = useState(false);

  const handleEditRepo = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingRepoValue(project.githubRepo || "");
  };

  const handleCancelEditRepo = () => {
    setEditingProjectId(null);
    setEditingRepoValue("");
  };

  const handleSaveRepo = async (projectId: number) => {
    setSavingRepo(true);
    try {
      await onSaveRepo(projectId, editingRepoValue);
      setEditingProjectId(null);
      setEditingRepoValue("");
    } finally {
      setSavingRepo(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setCreatingProject(true);
    try {
      await onCreateProject(
        newProjectName.trim(),
        newProjectDescription.trim(),
        newProjectGithubRepo.trim()
      );
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectGithubRepo("");
      setCreateProjectOpen(false);
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Proyectos ({projects.length})
          </CardTitle>
          <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear nuevo proyecto</DialogTitle>
                <DialogDescription>
                  Ingresa los datos del nuevo proyecto para {clientName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Nombre *</Label>
                  <Input
                    id="projectName"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Nombre del proyecto"
                    disabled={creatingProject}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Descripción</Label>
                  <Textarea
                    id="projectDescription"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Descripción del proyecto (opcional)"
                    rows={3}
                    disabled={creatingProject}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectGithubRepo">Repositorio GitHub</Label>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="projectGithubRepo"
                      value={newProjectGithubRepo}
                      onChange={(e) => setNewProjectGithubRepo(e.target.value)}
                      placeholder="owner/repo"
                      disabled={creatingProject}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateProjectOpen(false)}
                  disabled={creatingProject}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={creatingProject || !newProjectName.trim()}
                >
                  {creatingProject ? "Creando..." : "Crear proyecto"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin proyectos</p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-3 rounded-md border text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{project.name}</span>
                  {project.status}
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-3 w-3 text-muted-foreground" />
                  {editingProjectId === project.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingRepoValue}
                        onChange={(e) => setEditingRepoValue(e.target.value)}
                        placeholder="owner/repo"
                        className="h-7 text-xs flex-1"
                        disabled={savingRepo}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleSaveRepo(project.id)}
                        disabled={savingRepo}
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCancelEditRepo}
                        disabled={savingRepo}
                      >
                        <X className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-muted-foreground">
                        {project.githubRepo || "Sin repositorio"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEditRepo(project)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientProjectsCard;
