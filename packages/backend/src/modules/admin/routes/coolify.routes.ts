import { Router } from "express";
import { CoolifyController } from "../controllers/coolify.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();
const coolifyController = new CoolifyController();

// Projects
router.get(
  "/projects",
  verifyAdminToken,
  coolifyController.getProjects.bind(coolifyController)
);
router.get(
  "/projects/:uuid",
  verifyAdminToken,
  coolifyController.getProject.bind(coolifyController)
);

// Servers
router.get(
  "/servers",
  verifyAdminToken,
  coolifyController.getServers.bind(coolifyController)
);
router.get(
  "/servers/:uuid",
  verifyAdminToken,
  coolifyController.getServer.bind(coolifyController)
);
router.get(
  "/servers/:uuid/resources",
  verifyAdminToken,
  coolifyController.getServerResources.bind(coolifyController)
);

// Applications
router.get(
  "/applications",
  verifyAdminToken,
  coolifyController.getApplications.bind(coolifyController)
);
router.get(
  "/applications/:uuid",
  verifyAdminToken,
  coolifyController.getApplication.bind(coolifyController)
);
router.post(
  "/applications/:uuid/restart",
  verifyAdminToken,
  coolifyController.restartApplication.bind(coolifyController)
);
router.post(
  "/applications/:uuid/stop",
  verifyAdminToken,
  coolifyController.stopApplication.bind(coolifyController)
);
router.post(
  "/applications/:uuid/start",
  verifyAdminToken,
  coolifyController.startApplication.bind(coolifyController)
);
router.post(
  "/applications/:uuid/deploy",
  verifyAdminToken,
  coolifyController.deployApplication.bind(coolifyController)
);

// Databases
router.get(
  "/databases",
  verifyAdminToken,
  coolifyController.getDatabases.bind(coolifyController)
);
router.get(
  "/databases/:uuid",
  verifyAdminToken,
  coolifyController.getDatabase.bind(coolifyController)
);
router.post(
  "/databases/:uuid/restart",
  verifyAdminToken,
  coolifyController.restartDatabase.bind(coolifyController)
);
router.post(
  "/databases/:uuid/stop",
  verifyAdminToken,
  coolifyController.stopDatabase.bind(coolifyController)
);
router.post(
  "/databases/:uuid/start",
  verifyAdminToken,
  coolifyController.startDatabase.bind(coolifyController)
);

// Services
router.get(
  "/services",
  verifyAdminToken,
  coolifyController.getServices.bind(coolifyController)
);
router.get(
  "/services/:uuid",
  verifyAdminToken,
  coolifyController.getService.bind(coolifyController)
);
router.post(
  "/services/:uuid/restart",
  verifyAdminToken,
  coolifyController.restartService.bind(coolifyController)
);
router.post(
  "/services/:uuid/stop",
  verifyAdminToken,
  coolifyController.stopService.bind(coolifyController)
);
router.post(
  "/services/:uuid/start",
  verifyAdminToken,
  coolifyController.startService.bind(coolifyController)
);

// Deployments
router.get(
  "/deployments",
  verifyAdminToken,
  coolifyController.getDeployments.bind(coolifyController)
);
router.get(
  "/deployments/:uuid",
  verifyAdminToken,
  coolifyController.getDeployment.bind(coolifyController)
);

// All resources
router.get(
  "/resources",
  verifyAdminToken,
  coolifyController.getAllResources.bind(coolifyController)
);

export default router;
