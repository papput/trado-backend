import mongoose, { Schema } from "mongoose";
const bankAccountSchema = new Schema({
    account: { type: String, required: true },
    ifsc: { type: String, required: true },
    beneficiary: { type: String, required: true },
}, { timestamps: true });
const userSchema = new Schema({
    phone: { type: String, required: true, unique: true },
    countryCode: { type: String, default: "+91" },
    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    inviteCode: { type: String, unique: true },
    referredBy: { type: String },
    transactionPassword: { type: String },
    balance: { type: Number, default: 0 },
    balanceLimit: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String, default: null },
    kycStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    bankAccounts: { type: [bankAccountSchema], default: [] },
}, { timestamps: true });
export default mongoose.model("User", userSchema);
