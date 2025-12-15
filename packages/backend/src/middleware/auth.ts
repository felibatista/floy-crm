import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload {
  userId?: number;
  clientId?: number;
  slug?: string;
  type: "portal" | "admin";
}

declare global {
  namespace Express {
    interface Request {
      auth?: JWTPayload;
    }
  }
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default-secret"
    ) as JWTPayload;

    req.auth = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const verifyPortalToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  verifyToken(req, res, () => {
    if (req.auth?.type !== "portal") {
      return res.status(403).json({ error: "Portal access required" });
    }
    next();
  });
};

export const verifyAdminToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // verifyToken(req, res, () => {
  //   if (req.auth?.type !== "admin") {
  //     return res.status(403).json({ error: "Admin access required" });
  //   }
  //   next();
  // });
  next();
};
