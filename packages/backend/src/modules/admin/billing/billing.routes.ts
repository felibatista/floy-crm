import { Router } from "express";
import { BillingController } from "./billing.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();
const billingController = new BillingController();

// List all invoices with pagination and filters
router.get("/", verifyAdminToken, billingController.list.bind(billingController));

// Get billing stats
router.get("/stats", verifyAdminToken, billingController.getStats.bind(billingController));

// Get invoices by project
router.get(
  "/project/:projectId",
  verifyAdminToken,
  billingController.getByProjectId.bind(billingController)
);

// Get invoices by payment
router.get(
  "/payment/:paymentId",
  verifyAdminToken,
  billingController.getByPaymentId.bind(billingController)
);

// Get single invoice by ID
router.get("/:id", verifyAdminToken, billingController.getById.bind(billingController));

// Create new invoice
router.post("/", verifyAdminToken, billingController.create.bind(billingController));

// Update invoice
router.put("/:id", verifyAdminToken, billingController.update.bind(billingController));

// Delete invoice
router.delete("/:id", verifyAdminToken, billingController.delete.bind(billingController));

// Link invoice to payment
router.post(
  "/:id/link-payment",
  verifyAdminToken,
  billingController.linkToPayment.bind(billingController)
);

// Link invoice to project
router.post(
  "/:id/link-project",
  verifyAdminToken,
  billingController.linkToProject.bind(billingController)
);

export default router;
