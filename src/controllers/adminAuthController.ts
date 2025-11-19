import { Request, Response } from "express";
import Admin from "../models/Admin.js";
import { generateToken } from "../utils/jwt.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const admin: any = await Admin.findOne({ email });
    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check if locked
    if (admin.isAccountLocked()) {
      res.status(403).json({ error: "Account locked. Try again later." });
      return;
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 min
      }
      await admin.save();
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Reset attempts
    admin.loginAttempts = 0;
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id.toString());

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route POST /api/auth/create-admin
 * @desc Create a new admin account
 */
export const createAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Email, password, and name are required" });
      return;
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(409).json({ error: "Admin with this email already exists" });
      return;
    }

    const newAdmin = new Admin({
      email,
      password,
      name,
      role: role || "admin",
      isActive: true,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        _id: newAdmin._id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
      },
    });
  } catch (error: any) {
    console.error("Create Admin error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route POST /api/auth/change-password
 * @desc Change admin password
 */
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { adminId, currentPassword, newPassword } = req.body;

    if (!adminId || !currentPassword || !newPassword) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    if (newPassword.length < 6) {
      res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
      return;
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error: any) {
    console.error("Change password error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route POST /api/auth/logout
 * @desc Admin logout
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Logged out successfully" });
};
