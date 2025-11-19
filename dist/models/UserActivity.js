// models/UserActivity.ts
import mongoose, { Schema } from "mongoose";
const userActivitySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., "login", "deposit", "withdrawal"
    details: { type: String }, // optional extra info
    ipAddress: { type: String },
    userAgent: { type: String },
}, { timestamps: true });
export default mongoose.model("UserActivity", userActivitySchema);
