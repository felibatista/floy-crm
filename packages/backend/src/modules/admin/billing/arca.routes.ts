import { Router } from "express";
import { ArcaController } from "./arca.controller";
import { verifyAdminToken } from "../../../middleware/auth";

const router = Router();
const arcaController = new ArcaController();

// Get ARCA configuration
router.get("/config", verifyAdminToken, arcaController.getConfig.bind(arcaController));

// Save ARCA configuration
router.post("/config", verifyAdminToken, arcaController.saveConfig.bind(arcaController));
router.put("/config", verifyAdminToken, arcaController.saveConfig.bind(arcaController));

// Upload certificate
router.post(
  "/certificate",
  verifyAdminToken,
  arcaController.uploadCertificate.bind(arcaController)
);

// Generate new certificate (private key + CSR instructions)
router.post(
  "/certificate/generate",
  verifyAdminToken,
  arcaController.generateCertificate.bind(arcaController)
);

// Validate certificate
router.post(
  "/certificate/validate",
  verifyAdminToken,
  arcaController.validateCertificate.bind(arcaController)
);

// Get next invoice number
router.get(
  "/next-number",
  verifyAdminToken,
  arcaController.getNextInvoiceNumber.bind(arcaController)
);

// Authorize invoice with AFIP
router.post(
  "/authorize/:invoiceId",
  verifyAdminToken,
  arcaController.authorizeInvoice.bind(arcaController)
);

// Cancel invoice (create credit note)
router.post(
  "/cancel/:invoiceId",
  verifyAdminToken,
  arcaController.cancelInvoice.bind(arcaController)
);

export default router;
