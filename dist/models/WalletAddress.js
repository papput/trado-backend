import mongoose, { Schema } from "mongoose";
const walletAddressSchema = new Schema({
    userId: { type: String, required: true },
    network: { type: String, enum: ["tron", "ethereum"], required: true },
    address: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model("WalletAddress", walletAddressSchema);
