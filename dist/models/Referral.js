import mongoose, { Schema } from "mongoose";
const referralSchema = new Schema({
    referrerId: { type: String, required: true },
    referredUserId: { type: String, required: true },
    level: { type: Number, required: true },
    bonusPercentage: { type: Number, required: true },
    bonusAmount: { type: Number, default: 0 },
}, { timestamps: true });
export default mongoose.model("Referral", referralSchema);
