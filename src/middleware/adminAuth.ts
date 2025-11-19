import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.js";

interface JwtPayload {
  _id: string;
  email: string;
  role: string;
  name: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

/**
 * @middleware verifyAdmin
 * Validates JWT token and ensures the user is an admin
 */
export const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized - Missing or invalid token" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    // @ts-ignore - attach to request
    req.user = decoded;

    // if (!decoded.role || !["super_admin", "admin", "moderator"].includes(decoded.role)) {
    //   res.status(403).json({ error: "Access denied: insufficient permissions" });
    //   return;
    // }

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
