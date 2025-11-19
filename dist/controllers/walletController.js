import User from "../models/User.js";
import WalletAddress from "../models/WalletAddress.js";
// Get user balance
export const getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            balance: user.balance,
            currency: "USDT",
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch balance" });
    }
};
// Delete wallet address
export const deleteWalletAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const walletAddress = await WalletAddress.findOne({
            _id: id,
            userId: req.userId,
        });
        if (!walletAddress) {
            return res.status(404).json({ error: "Wallet address not found" });
        }
        await WalletAddress.deleteOne({ _id: id, userId: req.userId });
        res.json({
            message: "Wallet address deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete wallet address" });
    }
};
// Add wallet address
export const addWalletAddress = async (req, res) => {
    try {
        const { network, address } = req.body;
        if (!network || !address) {
            return res.status(400).json({ error: "Network and address required" });
        }
        if (!["tron", "ethereum"].includes(network)) {
            return res.status(400).json({ error: "Invalid network" });
        }
        const walletAddress = new WalletAddress({
            userId: req.userId,
            network,
            address,
            isDefault: true,
        });
        await walletAddress.save();
        res.json({
            message: "Wallet address added successfully",
            walletAddress,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to add wallet address" });
    }
};
// Get wallet addresses
export const getWalletAddresses = async (req, res) => {
    try {
        const walletAddresses = await WalletAddress.find({ userId: req.userId });
        res.json({
            walletAddresses,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch wallet addresses" });
    }
};
// Get wallet address by network
export const getWalletAddressByNetwork = async (req, res) => {
    try {
        const { network } = req.params;
        const walletAddress = await WalletAddress.findOne({
            userId: req.userId,
            network,
        });
        if (!walletAddress) {
            return res.status(404).json({ error: "Wallet address not found" });
        }
        res.json({
            walletAddress,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch wallet address" });
    }
};
