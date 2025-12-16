import app from "./app";
import { validateConnection } from "./lib/prisma";
import { startGitHubSyncJob } from "./jobs/github-sync";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  validateConnection();
  startGitHubSyncJob();
  console.log(`Server running on port ${PORT}`);
});
