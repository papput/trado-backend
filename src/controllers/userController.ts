import { Request, Response } from "express";
import User from "../models/User.js";

/**
 * @desc Get all users with optional search and pagination
 * @route GET /api/admin/users
 * @access Private (Admin)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search, page = "1", limit = "10" } = req.query as {
      search?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.max(parseInt(limit, 10), 1);

    const query: any = {};
    if (search && search.trim() !== "") {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Get a single user by ID
 * @route GET /api/admin/users/:id
 * @access Private (Admin)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Update user balance (add, subtract, or set)
 * @route PATCH /api/admin/users/:id/balance
 * @access Private (Admin)
 */
export const updateUserBalance = async (req: Request, res: Response) => {
  try {
    const { amount, action } = req.body as {
      amount: number;
      action?: "add" | "subtract" | "set";
    };

    if (typeof amount !== "number") {
      res.status(400).json({ error: "Amount must be a number" });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    switch (action) {
      case "add":
        user.balance += amount;
        break;
      case "subtract":
        user.balance -= amount;
        break;
      default:
        user.balance = amount;
        break;
    }

    await user.save();

    res.status(200).json({
      message: "User balance updated successfully",
      balance: user.balance,
    });
  } catch (error: any) {
    console.error("Error updating user balance:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Update a user's balance limit
 * @route PATCH /api/admin/users/:id/limit
 * @access Private (Admin)
 */
export const updateUserLimit = async (req: Request, res: Response) => {
  try {
    const { limit } = req.body as { limit: number };

    if (typeof limit !== "number") {
      res.status(400).json({ error: "Limit must be a number" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { balanceLimit: limit },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Balance limit updated successfully",
      balanceLimit: user.balanceLimit,
    });
  } catch (error: any) {
    console.error("Error updating user limit:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Block a user with a reason
 * @route PATCH /api/admin/users/:id/block
 * @access Private (Admin)
 */
export const blockUser = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body as { reason?: string };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true, blockReason: reason || "Blocked by admin" },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User blocked successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error blocking user:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Unblock a user
 * @route PATCH /api/admin/users/:id/unblock
 * @access Private (Admin)
 */
export const unblockUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false, blockReason: null },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User unblocked successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Delete a user by ID
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin)
 */
export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User deleted successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};


