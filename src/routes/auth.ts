import express from "express"
import { sendOTP, verifyOTPAndSignup, login, verifyTokenA } from "../controllers/authController.js"

const router = express.Router()

router.post("/send-otp", sendOTP)
router.post("/verify-otp-signup", verifyOTPAndSignup)
router.post("/login", login)
router.get("/verify-token", verifyTokenA); // ✅ new route

export default router
