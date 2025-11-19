import { Request, Response } from "express";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

/**
 * @desc Get all pending withdrawal requests
 * @route GET /api/admin/withdrawals/pending
 * @access Private (Admin)
 */
export const getPendingWithdrawals = async (req: Request, res: Response): Promise<void> => {
  try {
    const withdrawals = await Transaction.find({ type: "withdraw", status: "pending" })
      .populate("userId", "phone balance bankAccounts")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(withdrawals);
  } catch (error: any) {
    console.error("Error fetching pending withdrawals:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};


export const getWithdrawals = async (req: Request, res: Response): Promise<void> => {
  try {
    const withdrawals = await Transaction.find({ type: "withdraw" })
      .populate("userId", "phone balance bankAccounts")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(withdrawals);
  } catch (error: any) {
    console.error("Error fetching pending withdrawals:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};


/**
 * @desc Approve a withdrawal and deduct user's balance
 * @route POST /api/admin/withdrawals/:id/approve
 * @access Private (Admin)
 */
export const approveWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
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


    console.log(transaction,"transaction");
    

    const amount = (transaction as any).cryptoAmount || 0;
    if (user.balance < amount) {
      res.status(400).json({ error: "Insufficient balance" });
      return;
    }

    await user.save();

    // Update transaction
    transaction.status = "completed";
    // @ts-ignore (req.user added by middleware)
    transaction.approvedBy = req.user?._id;
    transaction.approvedAt = new Date();

    await transaction.save();

    res.status(200).json({
      message: "Withdrawal approved successfully",
      transaction,
    });
  } catch (error: any) {
    console.error("Error approving withdrawal:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Reject a withdrawal request
 * @route POST /api/admin/withdrawals/:id/reject
 * @access Private (Admin)
 */
export const rejectWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    if (transaction.status !== "pending") {
      res.status(400).json({ error: "Withdrawal already processed" });
      return;
    }

    const user = await User.findById(transaction.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // ✅ Refund user's balance
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
      message: "Withdrawal rejected and refunded successfully",
      transaction,
      refundedBalance: user.balance,
    });
  } catch (error: any) {
    console.error("Error rejecting withdrawal:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
