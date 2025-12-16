import { githubService } from "../modules/admin/github/github.service";

const SYNC_INTERVAL = 60 * 60 * 1000; // 1 hora en milisegundos

let syncInterval: NodeJS.Timeout | null = null;

async function runSync() {
  console.log("[GitHub Sync] Starting automatic sync...");

  try {
    const results = await githubService.syncAllRepositories();

    const totalCommits = results.reduce((acc, r) => acc + r.commitsLinked, 0);
    const totalFound = results.reduce((acc, r) => acc + r.commitsFound, 0);
    const errors = results.flatMap(r => r.errors);

    console.log(`[GitHub Sync] Completed: ${totalFound} commits found, ${totalCommits} linked`);

    if (errors.length > 0) {
      console.log(`[GitHub Sync] Errors: ${errors.join(", ")}`);
    }
  } catch (error) {
    console.error("[GitHub Sync] Error:", error);
  }
}

export function startGitHubSyncJob() {
  if (!process.env.GITHUB_TOKEN) {
    console.log("[GitHub Sync] GITHUB_TOKEN not configured, sync job disabled");
    return;
  }

  console.log("[GitHub Sync] Starting sync job (interval: 1 hour)");

  // Ejecutar inmediatamente al iniciar
  setTimeout(() => {
    runSync();
  }, 10000); // Esperar 10 segundos para que todo esté listo

  // Programar ejecución cada hora
  syncInterval = setInterval(runSync, SYNC_INTERVAL);
}

export function stopGitHubSyncJob() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log("[GitHub Sync] Sync job stopped");
  }
}

// Ejecutar sync manual (para testing)
export async function triggerSync() {
  return runSync();
}
