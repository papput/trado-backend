import type { Request, Response } from "express"
import User from "../models/User.js"
import Referral from "../models/Referral.js"

// Get referral code
export const getReferralCode = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const inviteLink = `https://trado-app.vercel.app/invite?code=${user.inviteCode}`

    res.json({
      referralCode: user.inviteCode,
      inviteLink,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch referral code" })
  }
}

// Get referral statistics
export const getReferralStats = async (req: Request, res: Response) => {
  try {
    const referrals = await Referral.find({ referrerId: req.userId })

    const totalBonus = referrals.reduce((sum, ref) => sum + ref.bonusAmount, 0)
    const referralsByLevel = {
      level1: referrals.filter((r) => r.level === 1).length,
      level2: referrals.filter((r) => r.level === 2).length,
      level3: referrals.filter((r) => r.level === 3).length,
      level4: referrals.filter((r) => r.level === 4).length,
      level5: referrals.filter((r) => r.level === 5).length,
    }

    res.json({
      totalReferrals: referrals.length,
      totalBonus,
      referralsByLevel,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch referral stats" })
  }
}

// Get referral history
export const getReferralHistory = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const referrals = await Referral.find({ referrerId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await Referral.countDocuments({ referrerId: req.userId })

    res.json({
      referrals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch referral history" })
  }
}
