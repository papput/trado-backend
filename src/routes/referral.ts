import express from "express"
import { authMiddleware } from "../middleware/auth.js"
import { getReferralCode, getReferralStats, getReferralHistory } from "../controllers/referralController.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/code", getReferralCode)
router.get("/stats", getReferralStats)
router.get("/history", getReferralHistory)

export default router
