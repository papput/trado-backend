import express from "express"
import { authMiddleware } from "../middleware/auth.js"
import { sendPasswordResetOTP, resetTransactionPassword } from "../controllers/passwordController.js"

const router = express.Router()

router.use(authMiddleware)

router.post("/send-reset-otp", sendPasswordResetOTP)
router.post("/reset", resetTransactionPassword)

export default router
