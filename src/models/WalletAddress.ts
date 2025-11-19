import mongoose, { Schema, type Document } from "mongoose"

export interface IWalletAddress extends Document {
  userId: string
  network: "tron" | "ethereum"
  address: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const walletAddressSchema = new Schema<IWalletAddress>(
  {
    userId: { type: String, required: true },
    network: { type: String, enum: ["tron", "ethereum"], required: true },
    address: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.model<IWalletAddress>("WalletAddress", walletAddressSchema)
