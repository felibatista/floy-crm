import { Router } from "express";
import prisma from "../../lib/prisma";

const router = Router();

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const client = req.clientPortal; // From middleware

  if (!client) return res.status(404).json({ error: "Portal not found" });

  // Verify email matches the client's email
  if (email !== client.email) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Check if password is set
  if (!client.passwordHash) {
    return res
      .status(403)
      .json({ error: "Account not activated. Please set up your password." });
  }

  // TODO: Verify password hash (using bcrypt/argon2)
  // For now, simple check (INSECURE - replace with real hashing)
  if (client.passwordHash !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // TODO: Generate JWT token
  res.json({
    token: "fake-jwt-token",
    client: { id: client.id, name: client.name },
  });
});

// Setup Password (First time)
router.post("/setup-password", async (req, res) => {
  const { email, newPassword, token } = req.body;
  const client = req.clientPortal;

  // In a real app, you'd verify a secure token sent via email.
  // For this MVP, we'll just check if the email matches and password is null.

  if (email !== client.email) {
    return res.status(401).json({ error: "Invalid email" });
  }

  if (client.passwordHash) {
    return res
      .status(400)
      .json({ error: "Password already set. Please login." });
  }

  // TODO: Hash the password
  const hashedPassword = newPassword;

  await prisma.client.update({
    where: { id: client.id },
    data: { passwordHash: hashedPassword },
  });

  res.json({ message: "Password set successfully. You can now login." });
});

export default router;
