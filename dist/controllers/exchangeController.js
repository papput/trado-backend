import Transaction from "../models/Transaction.js";
import AdminSettings from "../models/AdminSettings.js";
import User from "../models/User.js";
/**
 * @desc Get all pending exchange transactions
 * @route GET /api/admin/exchanges/pending
 * @access Private (Admin)
 */
export const getPendingExchanges = async (req, res) => {
    try {
        const exchanges = await Transaction.find({ type: "exchange", status: "pending" })
            .populate("userId", "phone balance")
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json(exchanges);
    }
    catch (error) {
        console.error("Error fetching pending exchanges:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
export const getExchanges = async (req, res) => {
    try {
        const exchanges = await Transaction.find({ type: "exchange" })
            .populate("userId", "phone balance")
            .sort({ createdAt: -1 })
            .lean();
        res.status(200).json(exchanges);
    }
    catch (error) {
        console.error("Error fetching pending exchanges:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
/**
 * @desc Approve an exchange transaction and update user balance
 * @route POST /api/admin/exchanges/:id/approve
 * @access Private (Admin)
 */
export const approveExchange = async (req, res) => {
    try {
        const { receivedAmount } = req.body;
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            res.status(404).json({ error: "Transaction not found" });
            return;
        }
        const user = await User.findById(transaction.userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        console.log(transaction, "transaction");
        const debitAmount = transaction.cryptoAmount || 0;
        const creditAmount = receivedAmount || transaction.receivedAmount || 0;
        // Adjust user's balance
        await user.save();
        // Update transaction details
        transaction.status = "completed";
        // @ts-ignore - populated by middleware
        transaction.approvedBy = req.user?._id;
        transaction.approvedAt = new Date();
        transaction.receivedAmount = creditAmount;
        await transaction.save();
        res.status(200).json({
            message: "Exchange approved successfully",
            transaction,
        });
    }
    catch (error) {
        console.error("Error approving exchange:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
/**
 * @desc Reject an exchange transaction
 * @route POST /api/admin/exchanges/:id/reject
 * @access Private (Admin)
 */
export const rejectExchange = async (req, res) => {
    try {
        const { reason } = req.body;
        const { id } = req.params;
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            res.status(404).json({ error: "Transaction not found" });
            return;
        }
        if (transaction.status !== "pending") {
            res.status(400).json({ error: "Exchange already processed" });
            return;
        }
        const user = await User.findById(transaction.userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // ✅ Refund user's crypto amount
        const refundAmount = transaction.cryptoAmount || 0;
        user.balance += refundAmount;
        await user.save();
        // ✅ Update transaction to rejected
        transaction.status = "rejected";
        transaction.rejectionReason = reason;
        transaction.approvedAt = new Date();
        // @ts-ignore
        transaction.approvedBy = req.user?._id;
        await transaction.save();
        res.status(200).json({
            message: "Exchange rejected and refunded successfully",
            transaction,
            refundedBalance: user.balance,
        });
    }
    catch (error) {
        console.error("Error rejecting exchange:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
/**
 * @desc Get current exchange rate configuration
 * @route GET /api/admin/exchanges/rate
 * @access Private (Admin)
 */
export const getExchangeRate = async (req, res) => {
    try {
        const rate = await AdminSettings.findOne({ key: "exchangeRate" }).lean();
        res.status(200).json(rate?.value || {
            USDT_USD: 1.0,
            USDT_INR: 83.0,
        });
    }
    catch (error) {
        console.error("Error fetching exchange rate:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
/**
 * @desc Set or update exchange rates
 * @route POST /api/admin/exchanges/rate
 * @access Private (Admin)
 */
export const setExchangeRate = async (req, res) => {
    try {
        const { rates } = req.body;
        if (!rates || typeof rates !== "object") {
            res.status(400).json({ error: "Invalid rates payload" });
            return;
        }
        let settings = await AdminSettings.findOne({ key: "exchangeRate" });
        if (!settings) {
            settings = new AdminSettings({ key: "exchangeRate", value: rates });
        }
        else {
            settings.value = { ...settings.value, ...rates };
        }
        await settings.save();
        res.status(200).json({
            message: "Exchange rates updated successfully",
            rates: settings.value,
        });
    }
    catch (error) {
        console.error("Error setting exchange rates:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
