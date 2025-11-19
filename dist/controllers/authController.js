import User from "../models/User.js";
import { generateOTP, generateInviteCode, isOTPExpired } from "../utils/otp.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import Referral from "../models/Referral.js";
import { logActivity } from "../utils/logActivity.js";
// ✅ Verify Token
export const verifyTokenA = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        console.log(authHeader, "auth header");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authorization token missing" });
        }
        const token = authHeader.split(" ")[1];
        console.log(token, "token");
        const decoded = verifyToken(token);
        console.log(decoded, "decoded");
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({
            valid: true,
            user: {
                id: user._id,
                phone: user.phone,
                countryCode: user.countryCode,
                balance: user.balance,
                transactionPassword: user.transactionPassword || "",
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(401).json({ error: "Token verification failed" });
    }
};
// Send OTP
// Send OTP using Ninza SMS
export const sendOTP = async (req, res) => {
    try {
        const { phone, countryCode } = req.body;
        if (!phone || !countryCode) {
            return res.status(400).json({ error: "Phone and country code required" });
        }
        let user = await User.findOne({ phone });
        if (!user) {
            const inviteCode = generateInviteCode();
            user = new User({ phone, countryCode, inviteCode });
        }
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
        // 🔐 Send via Ninza SMS API
        const apiKey = process.env.NINZA_API_KEY;
        const payload = {
            sender_id: "15574",
            variables_values: otp.toString(),
            numbers: phone,
            route: "waninza", // remove if using Bulk SMS
        };
        const response = await fetch("https://ninzasms.in.net/auth/send_sms", {
            method: "POST",
            headers: {
                authorization: apiKey,
                "content-type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        const smsResult = await response.json();
        console.log(smsResult, "sms result");
        if (!response.ok) {
            console.error("Failed to send SMS:", smsResult);
            return res.status(500).json({ error: "Failed to send OTP via SMS" });
        }
        res.json({
            message: "OTP sent successfully",
            phone,
            otpResponse: smsResult,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to send OTP" });
    }
};
// Verify OTP and Signup
export const verifyOTPAndSignup = async (req, res) => {
    try {
        const { phone, otp, inviteCode } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ error: "Phone and OTP required" });
        }
        const user = await User.findOne({ phone }).select("+otp +otpExpiry");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // if (user.isVerified) {
        //   // ✅ If user already verified, just return login response
        //   const token = generateToken(user._id.toString());
        //   return res.json({
        //     message: "User already verified",
        //     token,
        //     user: {
        //       id: user._id,
        //       phone: user.phone,
        //       countryCode: user.countryCode,
        //       balance: user.balance,
        //       transactionPassword: user?.transactionPassword || "",
        //     },
        //   });
        // }
        if (user.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }
        if (user.otpExpiry && isOTPExpired(user.otpExpiry)) {
            return res.status(400).json({ error: "OTP expired" });
        }
        // ✅ Mark user verified on first successful OTP check
        user.isVerified = true;
        // ⚠️ Don't remove OTP immediately — keep it until next call
        // Instead, we mark a flag so next time OTP gets cleared
        if (user._otpVerifiedOnce) {
            user.otp = undefined;
            user.otpExpiry = undefined;
        }
        else {
            user._otpVerifiedOnce = true; // custom temp flag
        }
        if (inviteCode) {
            const referrer = await User.findOne({ inviteCode });
            if (referrer) {
                // Store who referred this user
                user.referredBy = referrer._id.toString();
                await user.save();
                // ✅ Create referral record for Level 1
                await Referral.create({
                    referrerId: referrer._id,
                    referredUserId: user._id,
                    level: 1,
                    bonusAmount: 0,
                });
                // ✅ Optional: Create up to 5-level referral chain
                let currentReferrer = referrer;
                for (let level = 2; level <= 5; level++) {
                    if (!currentReferrer.referredBy)
                        break;
                    const upperReferrer = await User.findById(currentReferrer.referredBy);
                    if (!upperReferrer)
                        break;
                    await Referral.create({
                        referrerId: upperReferrer._id,
                        referredUserId: user._id,
                        level,
                        bonusAmount: 0,
                    });
                    currentReferrer = upperReferrer;
                }
            }
        }
        await user.save();
        const token = generateToken(user._id.toString());
        // ✅ Log login activity
        await logActivity(req, user._id.toString(), "login", "User logged in successfully");
        res.json({
            message: "OTP verified successfully",
            token,
            user: {
                id: user._id,
                phone: user.phone,
                balance: user.balance,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Signup failed" });
    }
};
// Login
export const login = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ error: "Phone required" });
        }
        const user = await User.findOne({ phone, isVerified: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const token = generateToken(user._id.toString());
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                phone: user.phone,
                balance: user.balance,
                transactionPassword: user?.transactionPassword || "",
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};
