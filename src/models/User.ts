import mongoose, { Schema, type Document } from "mongoose";

export interface IBankAccount {
  account: string;
  ifsc: string;
  beneficiary: string;
}

export interface IUser extends Document {
  phone: string;
  countryCode: string;
  otp?: string;
  otpExpiry?: Date;
  isVerified: boolean;
  inviteCode: string;
  referredBy?: string;
  transactionPassword?: string;
  balance: number;
  bankAccounts: IBankAccount[];
  createdAt: Date;
  updatedAt: Date;
  country?: string;

  balanceLimit: number;

  isBlocked: boolean;
  blockReason?: string;

  kycStatus: "pending" | "approved" | "rejected";
}

const bankAccountSchema = new Schema<IBankAccount>(
  {
    account: { type: String, required: true },
    ifsc: { type: String, required: true },
    beneficiary: { type: String, required: true },
  },
  { timestamps: true }
);

const userSchema = new Schema<IUser>(
  {
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
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
