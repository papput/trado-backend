import mongoose, { Schema, type Document } from "mongoose"

export interface IReferral extends Document {
  referrerId: string
  referredUserId: string
  level: number
  bonusPercentage: number
  bonusAmount: number
  createdAt: Date
}

const referralSchema = new Schema<IReferral>(
  {
    referrerId: { type: String, required: true },
    referredUserId: { type: String, required: true },
    level: { type: Number, required: true },
    bonusPercentage: { type: Number, required: true },
    bonusAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.model<IReferral>("Referral", referralSchema)
