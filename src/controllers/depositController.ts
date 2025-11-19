import { Request, Response } from "express";
import Transaction from "../models/Transaction.js";
import AdminSettings from "../models/AdminSettings.js";
import User from "../models/User.js";

/**
 * @desc Get all pending deposit transactions
 * @route GET /api/admin/deposits/pending
 * @access Private (Admin)
 */
export const getPendingDeposits = async (req: Request, res: Response) => {
  try {
    const deposits = await Transaction.find({
      type: "deposit",
      status: "pending",
    })
      .populate("userId", "phone balance")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(deposits);
  } catch (error: any) {
    console.error("Error fetching pending deposits:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const getDeposits = async (req: Request, res: Response) => {
  try {
    const deposits = await Transaction.find({ type: "deposit" })
      .populate("userId", "phone balance")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(deposits);
  } catch (error: any) {
    console.error("Error fetching pending deposits:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Approve a deposit transaction and update user balance
 * @route POST /api/admin/deposits/:id/approve
 * @access Private (Admin)
 */
export const approveDeposit = async (req: Request, res: Response) => {
  try {
    const { depositAmount } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    // Update transaction
    transaction.status = "completed";
    // @ts-ignore (req.user added by middleware)
    transaction.approvedBy = req.user?._id;
    transaction.approvedAt = new Date();
    await transaction.save();

    // Update user's balance
    const user = await User.findById(transaction.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const creditedAmount = depositAmount || (transaction as any).cryptoAmount || 0;
    user.balance += creditedAmount;
    await user.save();

    res.status(200).json({
      message: "Deposit approved and balance updated",
      transaction,
    });
  } catch (error: any) {
    console.error("Error approving deposit:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Reject a deposit transaction
 * @route POST /api/admin/deposits/:id/reject
 * @access Private (Admin)
 */
export const rejectDeposit = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        rejectionReason: reason,
        // @ts-ignore (req.user added by middleware)
        approvedBy: req.user?._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

    res.status(200).json({
      message: "Deposit rejected",
      transaction,
    });
  } catch (error: any) {
    console.error("Error rejecting deposit:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Get deposit wallet addresses (TRON / ETH)
 * @route GET /api/admin/deposits/addresses
 * @access Private (Admin)
 */
export const getDepositAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await AdminSettings.findOne({
      key: "depositAddresses",
    }).lean();

    res.status(200).json(
      addresses?.value || {
        tron: { address: "", qrCode: "" },
        ethereum: { address: "", qrCode: "" },
      }
    );
  } catch (error: any) {
    console.error("Error fetching deposit addresses:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * @desc Set or update a deposit address for a specific network
 * @route POST /api/admin/deposits/addresses
 * @access Private (Admin)
 */
export const setDepositAddress = async (req: any, res: Response) => {
  try {
    const { network, address } = req.body;
    const qrFile = req.file; // Multer adds this

    if (!network || !address) {
      return res.status(400).json({ error: "Network and address are required" });
    }

    let settings = await AdminSettings.findOne({ key: "depositAddresses" });
    if (!settings) {
      settings = new AdminSettings({
        key: "depositAddresses",
        value: {},
      });
    }

    if (!settings.value) settings.value = {};

    // Build file path or public URL
    let qrCodePath = settings.value[network]?.qrCode || "";

    if (qrFile) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      qrCodePath = `${baseUrl}/uploads/${qrFile.filename}`; // serve uploaded file publicly
    }

    settings.value[network] = {
      address,
      qrCode: qrCodePath,
    };

    settings.markModified("value");
    await settings.save();

    res.status(200).json({
      message: "Deposit address updated successfully",
      data: settings.value,
    });
  } catch (error: any) {
    console.error("Error updating deposit address:", error);
    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
