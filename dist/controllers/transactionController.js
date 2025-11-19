import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import crypto from "crypto";
import AdminSettings from "../models/AdminSettings.js";
import { logActivity } from "../utils/logActivity.js"; // ✅ Activity logger
// 🪙 Deposit initiation
export const depositUSDT = async (req, res) => {
    try {
        const { network, amount } = req.body;
        const userId = req.userId;
        if (!network || !amount) {
            return res.status(400).json({ msg: "Network and amount required", code: "40001" });
        }
        if (amount <= 0) {
            return res.status(400).json({ msg: "Invalid amount", code: "40002" });
        }
        // ✅ 1. Validate user
        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ msg: "User not found", code: "40401" });
        // ✅ 2. Get Admin Settings
        const [depositSettings, rateSettings] = await Promise.all([
            AdminSettings.findOne({ key: "depositAddresses" }).lean(),
            AdminSettings.findOne({ key: "exchangeRate" }).lean(),
        ]);
        // ✅ 3. Resolve deposit address and rate
        const depositAddress = depositSettings?.value?.[network]?.address || "";
        const qrCode = depositSettings?.value?.[network]?.qrCode || "";
        const exchangeRate = rateSettings?.value?.USDT_INR || 83;
        // ✅ 4. Generate unique transaction
        const rechargeNo = "TC" + crypto.randomBytes(10).toString("hex");
        const fiatAmount = parseFloat(amount) * exchangeRate;
        const expireTime = Date.now() + 30 * 60 * 1000;
        // ✅ 5. Create transaction
        const transaction = new Transaction({
            userId,
            type: "deposit",
            cryptoAmount: parseFloat(amount),
            fiatAmount,
            network,
            walletAddress: depositAddress,
            status: "pending",
            transactionHash: rechargeNo,
            qrCode,
        });
        await transaction.save();
        // ✅ Log activity
        await logActivity(req, userId, "deposit_initiated", `Started deposit of ${amount} USDT on ${network}`);
        // ✅ 6. Return response
        return res.status(200).json({
            msg: "success",
            code: "00000",
            data: {
                receive: {
                    address: depositAddress,
                    token: network === "tron" ? "USDT-TRC20" : "USDT-ERC20",
                    qrCode,
                },
                rechargeAccount: user.phone,
                expireTime,
                rechargeAmount: parseFloat(amount),
                fiatAmount,
                exchangeRate,
                statusStr: "Processing",
                createTime: Date.now(),
                rechargeNo,
                id: transaction._id,
                status: 0,
            },
        });
    }
    catch (error) {
        console.error("Deposit Error:", error);
        res.status(500).json({ error: "Failed to initiate deposit" });
    }
};
// 🧾 Confirm deposit
export const confirmDeposit = async (req, res) => {
    try {
        const { transactionId, txId } = req.body;
        const userId = req.userId;
        if (!transactionId || !txId)
            return res.status(400).json({ error: "Transaction ID and TxId required" });
        const transaction = await Transaction.findOne({
            transactionHash: transactionId,
            userId,
            type: "deposit",
        });
        if (!transaction)
            return res.status(404).json({ error: "Transaction not found" });
        if (transaction.status !== "pending")
            return res.status(400).json({ error: "Transaction already processed" });
        transaction.txHash = txId;
        await transaction.save();
        // ✅ Log activity
        await logActivity(req, userId, "deposit_confirmed", `Confirmed deposit TxId: ${txId}`);
        return res.status(200).json({
            message: "TxId submitted successfully",
            updatedTransaction: transaction,
        });
    }
    catch (error) {
        console.error("Confirm Deposit Error:", error);
        res.status(500).json({ error: "Failed to confirm deposit" });
    }
};
// 🚫 Cancel deposit
export const cancelDeposit = async (req, res) => {
    try {
        const { rechargeNo } = req.body;
        const userId = req.userId;
        if (!rechargeNo)
            return res.status(400).json({ msg: "RechargeNo required", code: "40001" });
        const transaction = await Transaction.findOne({
            userId,
            type: "deposit",
            transactionHash: rechargeNo,
        });
        if (!transaction)
            return res.status(404).json({ msg: "Transaction not found", code: "40401" });
        if (["completed", "failed"].includes(transaction.status))
            return res.status(400).json({ msg: "Transaction already processed", code: "40003" });
        transaction.status = "failed";
        await transaction.save();
        // ✅ Log activity
        await logActivity(req, userId, "deposit_cancelled", `Cancelled deposit ${rechargeNo}`);
        return res.status(200).json({
            msg: "success",
            code: "00000",
            data: { rechargeNo, statusStr: "failed", status: 2 },
        });
    }
    catch (error) {
        console.error("Cancel Deposit Error:", error);
        res.status(500).json({ msg: "Failed to cancel deposit", code: "50000" });
    }
};
// 💸 Withdraw
export const withdrawUSDT = async (req, res) => {
    try {
        const { network, amount, walletAddress, transactionPassword } = req.body;
        const user = await User.findById(req.userId);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        if (!network || !amount || !walletAddress || !transactionPassword)
            return res.status(400).json({ error: "Missing required fields" });
        if (amount <= 0)
            return res.status(400).json({ error: "Invalid amount" });
        if (user.transactionPassword !== transactionPassword)
            return res.status(401).json({ error: "Invalid transaction password" });
        if (user.balance < amount)
            return res.status(400).json({ error: "Insufficient balance" });
        user.balance -= amount;
        let exchangeRate = 83;
        const rateSettings = await AdminSettings.findOne({ key: "exchangeRate" }).lean();
        if (rateSettings?.value?.USDT_INR)
            exchangeRate = rateSettings.value.USDT_INR;
        const fiatAmount = amount * exchangeRate;
        const transaction = new Transaction({
            userId: req.userId,
            type: "withdraw",
            cryptoAmount: amount,
            fiatAmount,
            exchangeRate,
            network,
            walletAddress,
            status: "pending",
        });
        await Promise.all([transaction.save(), user.save()]);
        // ✅ Log activity
        await logActivity(req, req.userId, "withdraw_initiated", `Withdrew ${amount} USDT to ${walletAddress}`);
        return res.json({
            message: "Withdrawal initiated successfully",
            transaction,
            newBalance: user.balance,
        });
    }
    catch (error) {
        console.error("Withdraw Error:", error);
        res.status(500).json({ error: "Failed to initiate withdrawal" });
    }
};
// 🔄 Exchange USDT
export const exchangeUSDT = async (req, res) => {
    try {
        const { data } = req.body;
        const { cryptoAmount, transactionPassword, bankDetails } = data;
        if (!cryptoAmount || cryptoAmount <= 0)
            return res.status(400).json({ error: "Invalid amount" });
        const user = await User.findById(req.userId);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        if (user.transactionPassword !== transactionPassword)
            return res.status(401).json({ error: "Invalid transaction password" });
        if (user.balance < cryptoAmount)
            return res.status(400).json({ error: "Insufficient balance" });
        user.balance -= cryptoAmount;
        let rate = 87;
        const rateSetting = await AdminSettings.findOne({ key: "exchangeRate" });
        if (rateSetting?.value?.USDT_INR)
            rate = rateSetting.value.USDT_INR;
        const fiatAmount = cryptoAmount * rate;
        const transaction = new Transaction({
            userId: req.userId,
            type: "exchange",
            cryptoAmount,
            fiatAmount,
            exchangeRate: rate,
            network: "tron",
            status: "pending",
            bankDetails: {
                bankName: bankDetails?.bankName || "N/A",
                accountNumber: bankDetails?.accountNumber || "",
                accountHolder: bankDetails?.accountHolder || "",
                ifsc: bankDetails?.ifsc || "",
            },
        });
        await Promise.all([transaction.save(), user.save()]);
        // ✅ Log activity
        await logActivity(req, req.userId, "exchange_initiated", `Exchanged ${cryptoAmount} USDT to INR`);
        return res.json({
            msg: "success",
            code: "00000",
            data: {
                message: "Exchange request created successfully",
                transaction,
                newBalance: user.balance,
            },
        });
    }
    catch (error) {
        console.error("Exchange error:", error);
        return res.status(500).json({ error: "Failed to process exchange" });
    }
};
// 🏦 Add a new bank card
export const addBankCard = async (req, res) => {
    try {
        const { account, ifsc, beneficiary } = req.body;
        const user = await User.findById(req.userId);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const exists = user.bankAccounts.some((b) => b.account === account && b.ifsc === ifsc);
        if (exists)
            return res.status(400).json({ error: "Bank card already added" });
        user.bankAccounts.push({ account, ifsc, beneficiary });
        await user.save();
        // ✅ Log activity
        await logActivity(req, req.userId, "bank_card_added", `Added bank: ${beneficiary} (${account})`);
        res.json({ message: "Bank card added successfully", bankAccounts: user.bankAccounts });
    }
    catch (error) {
        console.error("Add bank card error:", error);
        res.status(500).json({ error: "Failed to add bank card" });
    }
};
// 🏦 Delete a bank card
export const deleteBankCard = async (req, res) => {
    try {
        const { account } = req.params;
        const user = await User.findById(req.userId);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const index = user.bankAccounts.findIndex((b) => b.account === account);
        if (index === -1)
            return res.status(404).json({ error: "Bank card not found" });
        const deletedCard = user.bankAccounts[index];
        user.bankAccounts.splice(index, 1);
        await user.save();
        // ✅ Log activity
        await logActivity(req, req.userId, "bank_card_deleted", `Deleted bank: ${deletedCard.beneficiary} (${account})`);
        res.json({ message: "Bank card deleted successfully", bankAccounts: user.bankAccounts });
    }
    catch (error) {
        console.error("Delete bank card error:", error);
        res.status(500).json({ error: "Failed to delete bank card" });
    }
};
// Get deposit history
export const getDepositHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const transactions = await Transaction.find({
            userId: req.userId,
            type: "deposit",
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Transaction.countDocuments({
            userId: req.userId,
            type: "deposit",
        });
        res.json({
            transactions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch deposit history" });
    }
};
// Get withdraw history
export const getWithdrawHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const transactions = await Transaction.find({
            userId: req.userId,
            type: "withdraw",
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Transaction.countDocuments({
            userId: req.userId,
            type: "withdraw",
        });
        res.json({
            transactions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch withdraw history" });
    }
};
// Get exchange history
export const getExchangeHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const transactions = await Transaction.find({
            userId: req.userId,
            type: "exchange",
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Transaction.countDocuments({
            userId: req.userId,
            type: "exchange",
        });
        res.json({
            transactions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch exchange history" });
    }
};
export const getBankCards = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("bankAccounts");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ bankAccounts: user.bankAccounts });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch bank cards" });
    }
};
