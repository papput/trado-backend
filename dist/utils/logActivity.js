// utils/logActivity.ts
import UserActivity from "../models/UserActivity.js";
export const logActivity = async (req, userId, action, details) => {
    try {
        await UserActivity.create({
            userId,
            action,
            details,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
        });
    }
    catch (error) {
        console.error("Failed to log activity:", error);
    }
};
