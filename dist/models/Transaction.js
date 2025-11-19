import mongoose, { Schema } from "mongoose";
const transactionSchema = new Schema({
    userId: { type: String, required: true },
    type: {
        type: String,
        enum: ["deposit", "withdraw", "exchange"],
        required: true,
    },
    cryptoAmount: { type: Number, required: true },
    fiatAmount: { type: Number, required: true },
    network: {
        type: String,
        enum: ["tron", "ethereum"],
        required: true,
    },
    walletAddress: { type: String },
    // Status & tracking
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed", "failed"],
        default: "pending",
    },
    transactionHash: { type: String },
    // Deposit
    txHash: { type: String },
    depositAddress: { type: String },
    qrCode: { type: String },
    // Withdrawal
    withdrawalAddress: { type: String },
    bankDetails: {
        bankName: { type: String },
        accountNumber: { type: String },
        accountHolder: { type: String },
        ifsc: { type: String },
    },
    // Exchange
    exchangeRate: { type: Number },
    fromCurrency: { type: String },
    toCurrency: { type: String },
    receivedAmount: { type: Number },
    // Misc
    currency: { type: String, default: "USDT" },
    description: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
}, { timestamps: true });
// ✅ Indexes for performance
transactionSchema.index({ userId: 1, type: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });
export default mongoose.model("Transaction", transactionSchema);
