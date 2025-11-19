import express from "express";
import { changePassword, createAdmin, login, logout } from "../controllers/adminAuthController.js";
import { verifyAdmin } from "../middleware/adminAuth.js";
const router = express.Router();
// Public routes
router.post("/login", login);
// Protected routes (use verifyAdmin if needed)
router.post("/logout", verifyAdmin, logout);
router.post("/create-admin", createAdmin);
router.post("/change-password", verifyAdmin, changePassword);
export default router;
