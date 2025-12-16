import { Request, Response } from "express";
import { githubService } from "./github.service";

export class GitHubController {
  // GET /api/admin/github/stats
  async getStats(req: Request, res: Response) {
    try {
      const stats = await githubService.getStats();
      res.json(stats);
    } catch (error: any) {
      console.error("[GitHubController] getStats error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/admin/github/sync-logs
  async getSyncLogs(req: Request, res: Response) {
    try {
      const { limit = "20" } = req.query;
      const logs = await githubService.getSyncLogs(parseInt(limit as string));
      res.json(logs);
    } catch (error: any) {
      console.error("[GitHubController] getSyncLogs error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/admin/github/sync
  async syncAll(req: Request, res: Response) {
    try {
      const results = await githubService.syncAllRepositories();
      res.json({
        message: "Sincronización completada",
        results,
      });
    } catch (error: any) {
      console.error("[GitHubController] syncAll error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/admin/github/sync/:owner/:repo
  async syncRepository(req: Request, res: Response) {
    try {
      const { owner, repo } = req.params;
      const repoFullName = `${owner}/${repo}`;
      const result = await githubService.syncRepository(repoFullName);
      res.json(result);
    } catch (error: any) {
      console.error("[GitHubController] syncRepository error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // POST /api/admin/github/validate
  async validateRepo(req: Request, res: Response) {
    try {
      const { repo } = req.body;
      if (!repo) {
        return res.status(400).json({ error: "repo es requerido" });
      }

      const result = await githubService.validateRepo(repo);
      res.json(result);
    } catch (error: any) {
      console.error("[GitHubController] validateRepo error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/admin/github/projects
  async getProjectsWithRepos(req: Request, res: Response) {
    try {
      const projects = await githubService.getProjectsWithRepos();
      res.json(projects);
    } catch (error: any) {
      console.error("[GitHubController] getProjectsWithRepos error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /api/admin/github/commits/task/:taskId
  async getCommitsByTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const commits = await githubService.getCommitsByTask(parseInt(taskId));
      res.json(commits);
    } catch (error: any) {
      console.error("[GitHubController] getCommitsByTask error:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const githubController = new GitHubController();
