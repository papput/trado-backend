import mongoose, { Schema } from "mongoose";
const adminSettingsSchema = new Schema({
    key: { type: String, unique: true, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
// Optional index for faster lookups by key
adminSettingsSchema.index({ key: 1 });
export default mongoose.model("AdminSettings", adminSettingsSchema);
