import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import UserActivity from "../models/UserActivity.js";
/**
 * @desc Get admin dashboard statistics
 * @route GET /api/admin/dashboard
 * @access Private (Admin)
 */
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBalance = await User.aggregate([
            { $group: { _id: null, total: { $sum: "$balance" } } },
        ]);
        const pendingDeposits = await Transaction.countDocuments({
            type: "deposit",
            status: "pending",
        });
        const pendingWithdrawals = await Transaction.countDocuments({
            type: "withdrawal",
            status: "pending",
        });
        const pendingExchanges = await Transaction.countDocuments({
            type: "exchange",
            status: "pending",
        });
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        res.status(200).json({
            totalUsers,
            totalBalance: totalBalance[0]?.total || 0,
            pendingDeposits,
            pendingWithdrawals,
            pendingExchanges,
            blockedUsers,
            totalPending: pendingDeposits + pendingWithdrawals + pendingExchanges,
        });
    }
    catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
/**
 * @desc Get recent activity feed (latest 50 transactions)
 * @route GET /api/admin/activity
 * @access Private (Admin)
 */
export const getActivityFeed = async (req, res) => {
    try {
        const activities = await Transaction.find()
            .populate("userId", "username email")
            .populate("approvedBy", "username")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean(); // improves performance
        res.status(200).json(activities);
    }
    catch (error) {
        console.error("Error fetching activity feed:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
export const getAllUserActivities = async (req, res) => {
    try {
        const activities = await UserActivity.find()
            .populate("userId", "phone countryCode isBlocked")
            .sort({ createdAt: -1 })
            .limit(200)
            .lean();
        res.status(200).json(activities);
    }
    catch (error) {
        console.error("Error fetching user activities:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
