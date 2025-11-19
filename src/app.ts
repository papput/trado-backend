import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import walletRoutes from "./routes/wallet.js";
import transactionRoutes from "./routes/transaction.js";
import referralRoutes from "./routes/referral.js";
import passwordRoutes from "./routes/password.js";
import adminRoutes from "./routes/admin.js";
import path from "path";

import adminAuthRoutes from "./routes/adminAuth.js";

dotenv.config();

const app = express();

// // ✅ CORS Configuration
const allowedOrigins = [
  "https://trado-app.vercel.app",
  "http://localhost:3001",
  "https://trado-admin.vercel.app",
  "http://localhost:3000",
  "http://localhost:3002",
  "https://tradofrontend.netlify.app",
  "https://trado-admin.netlify.app",
  "https://trado.exchange",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if using cookies or Authorization headers
  })
);

// Middleware
app.use(express.json());

// Connect to database
connectDB();
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-auth", adminAuthRoutes);

app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/password", passwordRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

export default app;
