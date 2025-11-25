import { Router } from "express";
import prisma from "../../lib/prisma";

const router = Router();

// Get all clients
router.get("/", async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { projects: true, tickets: true },
        },
      },
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

// Create a new client (and portal)
router.post("/", async (req, res) => {
  const { name, email, slug, isPortalEnabled } = req.body;

  try {
    // Check if slug exists
    const existingSlug = await prisma.client.findUnique({ where: { slug } });
    if (existingSlug) {
      return res.status(400).json({ error: "Subdomain already taken" });
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        slug,
        isPortalEnabled: isPortalEnabled || false,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create client" });
  }
});

// Update client
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, slug, isPortalEnabled, domain } = req.body;

  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        slug,
        isPortalEnabled,
        domain,
      },
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Failed to update client" });
  }
});

export default router;
