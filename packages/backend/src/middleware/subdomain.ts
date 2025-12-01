import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      clientPortal?: any;
      isPortal?: boolean;
    }
  }
}

export const subdomainMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const host = req.headers.host || "";

  // Logic to extract subdomain.
  // Assuming format: subdomain.domain.com or subdomain.localhost:3000
  const parts = host.split(".");

  // Adjust this logic based on your actual domain structure.
  // For localhost development (e.g. defender.localhost:3000), parts[0] is the subdomain.
  // For production (e.g. defender.acentus.com.ar), parts[0] is the subdomain.

  let subdomain = "";

  if (host.includes("localhost")) {
    // localhost:3000 -> parts=['localhost:3000'] (length 1) -> no subdomain
    // defender.localhost:3000 -> parts=['defender', 'localhost:3000'] (length 2) -> subdomain = defender
    if (parts.length > 1) {
      subdomain = parts[0];
    }
  } else {
    // defender.acentus.com.ar -> parts=['defender', 'acentus', 'com', 'ar']
    // www.acentus.com.ar -> parts=['www', 'acentus', 'com', 'ar']
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  // Reserved subdomains for the main admin panel
  const reservedSubdomains = ["www", "admin", "api", "app"];

  if (!subdomain || reservedSubdomains.includes(subdomain)) {
    req.isPortal = false;
    return next();
  }

  // It's a potential client portal
  try {
    const client = await prisma.client.findUnique({
      where: { slug: subdomain },
    });

    if (!client) {
      return res.status(404).json({ error: "Portal not found" });
    }

    if (!client.isPortalEnabled) {
      return res
        .status(403)
        .json({ error: "Portal access is disabled for this client" });
    }

    req.isPortal = true;
    req.clientPortal = client;
    next();
  } catch (error) {
    console.error("Subdomain middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
