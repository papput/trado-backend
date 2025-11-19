// models/UserActivity.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., "login", "deposit", "withdrawal"
    details: { type: String }, // optional extra info
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUserActivity>("UserActivity", userActivitySchema);
