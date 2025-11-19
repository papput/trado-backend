import mongoose, { Schema, Document } from "mongoose";

export interface IAdminSettings extends Document {
  key: string;
  value: any; // or you can narrow this down later (e.g. Record<string, unknown>)
  description?: string;
  updatedAt: Date;
  createdAt: Date;
}

const adminSettingsSchema = new Schema<IAdminSettings>(
  {
    key: { type: String, unique: true, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Optional index for faster lookups by key
adminSettingsSchema.index({ key: 1 });

export default mongoose.model<IAdminSettings>(
  "AdminSettings",
  adminSettingsSchema
);
