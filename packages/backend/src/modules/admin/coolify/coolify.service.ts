// Ensure the API URL ends with /v1
const rawApiUrl =
  process.env.COOLIFY_API_URL || "https://coolify.acentus.com.ar/api/v1";
const COOLIFY_API_URL = rawApiUrl.endsWith("/v1")
  ? rawApiUrl
  : `${rawApiUrl}/v1`;
const COOLIFY_TOKEN = process.env.COOLIFY_TOKEN || "";

// Debug: Log configuration on startup
console.log("[Coolify] API URL:", COOLIFY_API_URL);
console.log(
  "[Coolify] Token configured:",
  COOLIFY_TOKEN ? "Yes (length: " + COOLIFY_TOKEN.length + ")" : "No"
);

interface CoolifyRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
}

export class CoolifyService {
  private async request<T>(
    endpoint: string,
    options: CoolifyRequestOptions = {}
  ): Promise<T> {
    const { method = "GET", body } = options;
    const url = `${COOLIFY_API_URL}${endpoint}`;

    console.log(`[Coolify] ${method} ${url}`);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${COOLIFY_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      console.log(`[Coolify] Response status: ${response.status}`);

      if (!response.ok) {
        const error = await response.text();
        console.error(`[Coolify] Error response:`, error);
        throw new Error(`Coolify API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      console.log(
        `[Coolify] Response data:`,
        JSON.stringify(data).substring(0, 200) + "..."
      );
      return data;
    } catch (err: any) {
      console.error(`[Coolify] Request failed:`, err.message);
      throw err;
    }
  }

  // Projects
  async getProjects() {
    return this.request<any[]>("/projects");
  }

  async getProject(uuid: string) {
    return this.request<any>(`/projects/${uuid}`);
  }

  // Servers
  async getServers() {
    return this.request<any[]>("/servers");
  }

  async getServer(uuid: string) {
    return this.request<any>(`/servers/${uuid}`);
  }

  async getServerResources(uuid: string) {
    return this.request<any>(`/servers/${uuid}/resources`);
  }

  // Applications - uses /resources endpoint per Coolify API
  async getApplications() {
    return this.request<any[]>("/resources");
  }

  async getApplication(uuid: string) {
    return this.request<any>(`/applications/${uuid}`);
  }

  // Note: Coolify uses GET for start/stop/restart operations
  async restartApplication(uuid: string) {
    return this.request<any>(`/applications/${uuid}/restart`, {
      method: "GET",
    });
  }

  async stopApplication(uuid: string) {
    return this.request<any>(`/applications/${uuid}/stop`, { method: "GET" });
  }

  async startApplication(uuid: string) {
    return this.request<any>(`/applications/${uuid}/start`, { method: "GET" });
  }

  async deployApplication(uuid: string) {
    return this.request<any>(`/applications/${uuid}/deploy`, {
      method: "POST",
    });
  }

  // Databases
  async getDatabases() {
    return this.request<any[]>("/databases");
  }

  async getDatabase(uuid: string) {
    return this.request<any>(`/databases/${uuid}`);
  }

  async restartDatabase(uuid: string) {
    return this.request<any>(`/databases/${uuid}/restart`, { method: "GET" });
  }

  async stopDatabase(uuid: string) {
    return this.request<any>(`/databases/${uuid}/stop`, { method: "GET" });
  }

  async startDatabase(uuid: string) {
    return this.request<any>(`/databases/${uuid}/start`, { method: "GET" });
  }

  // Services
  async getServices() {
    return this.request<any[]>("/services");
  }

  async getService(uuid: string) {
    return this.request<any>(`/services/${uuid}`);
  }

  async restartService(uuid: string) {
    return this.request<any>(`/services/${uuid}/restart`, { method: "GET" });
  }

  async stopService(uuid: string) {
    return this.request<any>(`/services/${uuid}/stop`, { method: "GET" });
  }

  async startService(uuid: string) {
    return this.request<any>(`/services/${uuid}/start`, { method: "GET" });
  }

  // Deployments
  async getDeployments() {
    return this.request<any[]>("/deployments");
  }

  async getDeployment(uuid: string) {
    return this.request<any>(`/deployments/${uuid}`);
  }

  // Resources (combined view)
  async getAllResources() {
    const [applications, databases, services] = await Promise.all([
      this.getApplications().catch(() => []),
      this.getDatabases().catch(() => []),
      this.getServices().catch(() => []),
    ]);

    return {
      applications,
      databases,
      services,
    };
  }

  // Get project with its resources populated in environments
  async getProjectWithResources(uuid: string) {
    // Get project details and all resources in parallel
    const [project, resources] = await Promise.all([
      this.getProject(uuid),
      this.getApplications().catch(() => []),
    ]);

    console.log("[Coolify] Project:", JSON.stringify(project, null, 2));
    console.log("[Coolify] Resources count:", resources.length);

    // Resources from /resources endpoint have environment_id directly
    // Group resources by environment
    if (project.environments && Array.isArray(project.environments)) {
      project.environments = project.environments.map((env: any) => {
        // Filter resources that belong to this environment by environment_id
        // The environment already belongs to this project, so we just match by env id
        const envResources = resources.filter((r: any) => {
          return r.environment_id === env.id;
        });

        console.log(
          `[Coolify] Env ${env.name} (id=${env.id}): found ${envResources.length} resources`
        );

        // Separate by type
        const applications = envResources.filter(
          (r: any) => r.type === "application"
        );
        const databases = envResources.filter(
          (r: any) =>
            r.type === "database" ||
            r.type === "postgresql" ||
            r.type === "mysql" ||
            r.type === "mariadb" ||
            r.type === "mongodb" ||
            r.type === "redis" ||
            r.type === "clickhouse"
        );
        const services = envResources.filter(
          (r: any) => r.type === "service" || r.type === "minio"
        );

        console.log(
          `[Coolify] Env ${env.name}: ${applications.length} apps, ${databases.length} dbs, ${services.length} services`
        );

        return {
          ...env,
          applications,
          databases,
          services,
        };
      });
    }

    return project;
  }
}

export const coolifyService = new CoolifyService();
