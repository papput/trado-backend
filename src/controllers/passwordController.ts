import type { Request, Response } from "express"
import User from "../models/User.js"
import { generateOTP, isOTPExpired } from "../utils/otp.js"

// Send OTP for password reset
export const sendPasswordResetOTP = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min validity

    user.otp = otp
    user.otpExpiry = otpExpiry
    await user.save()

    // 🔐 Send OTP via Ninza SMS
    const apiKey = process.env.NINZA_API_KEY
    const payload = {
      sender_id: "15574", // your sender ID from Ninza
      variables_values: otp.toString(),
      numbers: user.phone, // user’s phone number
      route: "waninza", // use for WhatsApp; remove for Bulk SMS
    }

    const response = await fetch("https://ninzasms.in.net/auth/send_sms", {
      method: "POST",
      headers: {
        "authorization": apiKey!,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const smsResult = await response.json()
    console.log("Password Reset OTP SMS Response:", smsResult)

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to send OTP via SMS" })
    }

    res.json({
      message: "OTP sent successfully",
      phone: user.phone,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to send OTP" })
  }
}

// Reset transaction password
export const resetTransactionPassword = async (req: Request, res: Response) => {
  try {
    const { otp, newPassword } = req.body

    if (!otp || !newPassword) {
      return res.status(400).json({ error: "OTP and new password required" })
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 digits" })
    }

    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" })
    }

    if (user.otpExpiry && isOTPExpired(user.otpExpiry)) {
      return res.status(400).json({ error: "OTP expired" })
    }

    user.transactionPassword = newPassword
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    res.json({
      message: "Transaction password reset successfully",
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to reset password" })
  }
}
