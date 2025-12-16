import { prisma } from "../../../lib/prisma";

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

interface SyncResult {
  repository: string;
  commitsFound: number;
  commitsLinked: number;
  errors: string[];
}

export class GitHubService {
  private token: string | null;

  constructor() {
    this.token = process.env.GITHUB_TOKEN || null;
  }

  private async fetchGitHub(url: string) {
    if (!this.token) {
      throw new Error("GITHUB_TOKEN no está configurado");
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Floy-CRM",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Obtiene commits de un repositorio (últimos 100)
  async getRepoCommits(owner: string, repo: string, since?: Date): Promise<GitHubCommit[]> {
    let url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`;

    if (since) {
      url += `&since=${since.toISOString()}`;
    }

    return this.fetchGitHub(url);
  }

  async getRepoInfo(owner: string, repo: string) {
    return this.fetchGitHub(`https://api.github.com/repos/${owner}/${repo}`);
  }

  // Valida que el token y repo sean válidos
  async validateRepo(repoFullName: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const [owner, repo] = repoFullName.split("/");
      if (!owner || !repo) {
        return { valid: false, error: "Formato inválido. Usa: owner/repo" };
      }

      await this.getRepoInfo(owner, repo);
      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  // Extrae códigos de tarea del mensaje del commit (ej: "ABC-001", "DEFND-123")
  private extractTaskCodes(message: string): string[] {
    // Busca patrones como ABC-001, DEFND-123, etc.
    const regex = /[A-Z]{2,10}-\d{3,}/gi;
    const matches = message.match(regex);
    return matches ? [...new Set(matches.map(m => m.toUpperCase()))] : [];
  }

  // Sincroniza commits de un repositorio con las tareas
  async syncRepository(repoFullName: string): Promise<SyncResult> {
    const [owner, repo] = repoFullName.split("/");
    const result: SyncResult = {
      repository: repoFullName,
      commitsFound: 0,
      commitsLinked: 0,
      errors: [],
    };

    // Iniciar log de sincronización
    const syncLog = await prisma.gitHubSyncLog.create({
      data: {
        repository: repoFullName,
        status: "running",
      },
    });

    try {
      // Obtener último commit sincronizado para este repo
      const lastCommit = await prisma.commit.findFirst({
        where: { repository: repoFullName },
        orderBy: { committedAt: "desc" },
      });

      // Obtener commits desde la última sincronización (o últimos 7 días)
      const since = lastCommit?.committedAt || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const commits = await this.getRepoCommits(owner, repo, since);
      result.commitsFound = commits.length;

      // Obtener todos los códigos de tareas existentes
      const taskCodes = await prisma.task.findMany({
        select: { id: true, code: true },
      });
      const taskCodeMap = new Map(taskCodes.map(t => [t.code.toUpperCase(), t.id]));

      // Procesar cada commit
      for (const commit of commits) {
        // Verificar si ya existe
        const existing = await prisma.commit.findUnique({
          where: { hash: commit.sha },
        });

        if (existing) continue;

        // Extraer códigos de tarea del mensaje
        const codes = this.extractTaskCodes(commit.commit.message);

        for (const code of codes) {
          const taskId = taskCodeMap.get(code);
          if (taskId) {
            try {
              await prisma.commit.create({
                data: {
                  taskId,
                  message: commit.commit.message,
                  author: commit.commit.author.name,
                  hash: commit.sha,
                  repository: repoFullName,
                  url: commit.html_url,
                  committedAt: new Date(commit.commit.author.date),
                },
              });
              result.commitsLinked++;
            } catch (err: any) {
              // Si ya existe (por unique constraint), continuar
              if (!err.message.includes("Unique constraint")) {
                result.errors.push(`Error linking commit ${commit.sha}: ${err.message}`);
              }
            }
          }
        }
      }

      // Actualizar log de sincronización
      await prisma.gitHubSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "success",
          commitsFound: result.commitsFound,
          commitsLinked: result.commitsLinked,
          finishedAt: new Date(),
        },
      });
    } catch (error: any) {
      // Registrar error en log
      await prisma.gitHubSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: "error",
          errorMessage: error.message,
          finishedAt: new Date(),
        },
      });
      result.errors.push(error.message);
    }

    return result;
  }

  // Sincroniza todos los repositorios configurados
  async syncAllRepositories(): Promise<SyncResult[]> {
    const projects = await prisma.project.findMany({
      where: {
        githubRepo: { not: null },
      },
      select: { githubRepo: true },
    });

    const uniqueRepos = [...new Set(projects.map(p => p.githubRepo).filter(Boolean))] as string[];
    const results: SyncResult[] = [];

    for (const repo of uniqueRepos) {
      const result = await this.syncRepository(repo);
      results.push(result);
    }

    return results;
  }

  // Obtiene estadísticas de GitHub
  async getStats() {
    const [
      totalCommits,
      reposConfigured,
      lastSync,
      commitsByRepo,
    ] = await Promise.all([
      prisma.commit.count(),
      prisma.project.count({ where: { githubRepo: { not: null } } }),
      prisma.gitHubSyncLog.findFirst({
        where: { status: "success" },
        orderBy: { finishedAt: "desc" },
      }),
      prisma.commit.groupBy({
        by: ["repository"],
        _count: { id: true },
      }),
    ]);

    return {
      totalCommits,
      reposConfigured,
      lastSync: lastSync?.finishedAt || null,
      commitsByRepo: commitsByRepo.map(r => ({
        repository: r.repository,
        count: r._count.id,
      })),
      isConfigured: !!this.token,
    };
  }

  // Obtiene logs de sincronización
  async getSyncLogs(limit = 20) {
    return prisma.gitHubSyncLog.findMany({
      orderBy: { startedAt: "desc" },
      take: limit,
    });
  }

  // Obtiene commits de una tarea
  async getCommitsByTask(taskId: number) {
    return prisma.commit.findMany({
      where: { taskId },
      orderBy: { committedAt: "desc" },
    });
  }

  // Obtiene proyectos con sus repos configurados
  async getProjectsWithRepos() {
    return prisma.project.findMany({
      where: {
        githubRepo: { not: null },
      },
      select: {
        id: true,
        name: true,
        githubRepo: true,
        client: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });
  }
}

export const githubService = new GitHubService();
