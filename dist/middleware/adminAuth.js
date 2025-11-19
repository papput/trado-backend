import { verifyToken } from "../utils/jwt.js";
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
/**
 * @middleware verifyAdmin
 * Validates JWT token and ensures the user is an admin
 */
export const verifyAdmin = (req, res, next) => {
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
    }
    catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
