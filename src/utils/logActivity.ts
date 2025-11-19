// utils/logActivity.ts
import UserActivity from "../models/UserActivity.js";
import type { Request } from "express";

export const logActivity = async (
  req: Request,
  userId: any,
  action: string,
  details?: string
) => {
  try {
    await UserActivity.create({
      userId,
      action,
      details,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
