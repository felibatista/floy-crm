import { Request, Response } from "express";
import { coolifyService } from "./coolify.service";

export class CoolifyController {
  // Projects
  async getProjects(req: Request, res: Response) {
    try {
      const projects = await coolifyService.getProjects();
      res.json(projects);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch projects" });
    }
  }

  async getProject(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      // Use getProjectWithResources to include applications/databases/services
      const project = await coolifyService.getProjectWithResources(uuid);
      res.json(project);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch project" });
    }
  }

  // Servers
  async getServers(req: Request, res: Response) {
    try {
      const servers = await coolifyService.getServers();
      res.json(servers);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch servers" });
    }
  }

  async getServer(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const server = await coolifyService.getServer(uuid);
      res.json(server);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch server" });
    }
  }

  async getServerResources(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const resources = await coolifyService.getServerResources(uuid);
      res.json(resources);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch server resources" });
    }
  }

  // Applications
  async getApplications(req: Request, res: Response) {
    try {
      const applications = await coolifyService.getApplications();
      res.json(applications);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch applications" });
    }
  }

  async getApplication(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const application = await coolifyService.getApplication(uuid);
      res.json(application);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch application" });
    }
  }

  async restartApplication(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const result = await coolifyService.restartApplication(uuid);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to restart application" });
    }
  }

  async stopApplication(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const result = await coolifyService.stopApplication(uuid);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to stop application" });
    }
  }

  async startApplication(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const result = await coolifyService.startApplication(uuid);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to start application" });
    }
  }

  async deployApplication(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const result = await coolifyService.deployApplication(uuid);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to deploy application" });
    }
  }

  // Databases
  async getDatabases(req: Request, res: Response) {
    try {
      const databases = await coolifyService.getDatabases();
      res.json(databases);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch databases" });
    }
  }

  async getDatabase(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const database = await coolifyService.getDatabase(uuid);
      res.json(database);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch database" });
    }
  }

  async restartDatabase(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const result = await coolifyService.restartDatabase(uuid);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to restart database" });
    }
  }

  async stopDatabase(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const result = await coolifyService.stopDatabase(uuid);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to stop database" });
    }
  }

  async startDatabase(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const result = await coolifyService.startDatabase(uuid);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to start database" });
    }
  }

  // Services
  async getServices(req: Request, res: Response) {
    try {
      const services = await coolifyService.getServices();
      res.json(services);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch services" });
    }
  }

  async getService(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const service = await coolifyService.getService(uuid);
      res.json(service);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch service" });
    }
  }

  async restartService(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const result = await coolifyService.restartService(uuid);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to restart service" });
    }
  }

  async stopService(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const result = await coolifyService.stopService(uuid);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to stop service" });
    }
  }

  async startService(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const result = await coolifyService.startService(uuid);
      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to start service" });
    }
  }

  // Deployments
  async getDeployments(req: Request, res: Response) {
    try {
      const deployments = await coolifyService.getDeployments();
      res.json(deployments);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch deployments" });
    }
  }

  async getDeployment(req: Request, res: Response) {
    try {
      const { uuid } = req.params;
      const deployment = await coolifyService.getDeployment(uuid);
      res.json(deployment);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch deployment" });
    }
  }

  // All resources
  async getAllResources(req: Request, res: Response) {
    try {
      const resources = await coolifyService.getAllResources();
      res.json(resources);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch resources" });
    }
  }
}

export const coolifyController = new CoolifyController();
