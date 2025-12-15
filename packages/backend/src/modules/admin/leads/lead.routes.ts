import { Router } from "express";
import { LeadController } from "./lead.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();
const leadController = new LeadController();

router.get("/", verifyAdminToken, (req, res) => leadController.list(req, res));
router.get("/:id", verifyAdminToken, (req, res) =>
  leadController.getById(req, res)
);
router.post("/", verifyAdminToken, (req, res) =>
  leadController.create(req, res)
);
router.put("/:id", verifyAdminToken, (req, res) =>
  leadController.update(req, res)
);
router.delete("/:id", verifyAdminToken, (req, res) =>
  leadController.delete(req, res)
);
router.post("/:id/convert", verifyAdminToken, (req, res) =>
  leadController.convertToClient(req, res)
);

export default router;
