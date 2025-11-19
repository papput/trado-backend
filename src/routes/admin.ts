import express, { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUserBalance,
  updateUserLimit,
  blockUser,
  unblockUser,
  deleteUserById
} from "../controllers/userController.js";
import {
  getPendingDeposits,
  approveDeposit,
  rejectDeposit,
  getDepositAddresses,
  setDepositAddress,
  getDeposits
} from "../controllers/depositController.js";
import {
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getWithdrawals,
} from "../controllers/withdrawalController.js";
import {
  getPendingExchanges,
  approveExchange,
  rejectExchange,
  getExchangeRate,
  setExchangeRate,
  getExchanges,
} from "../controllers/exchangeController.js";
import {
  getAdminStats,
  getActivityFeed,
  getAllUserActivities,
} from "../controllers/dashboardController.js";
import { verifyAdmin } from "../middleware/adminAuth.js";
import { upload } from "../middleware/upload.js";

// Create router
const router: Router = express.Router();

// ✅ Middleware to protect all admin routes
router.use(verifyAdmin);

// ------------------- Dashboard -------------------
router.get("/dashboard", getAdminStats);
router.get("/activity", getActivityFeed);
router.get("/activities", getAllUserActivities);


// ------------------- User Management -------------------
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/balance", updateUserBalance);
router.patch("/users/:id/limit", updateUserLimit);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.delete("/users/:id", deleteUserById);

// ------------------- Deposit Management -------------------
router.get("/deposits/pending", getPendingDeposits);
router.get("/deposits", getDeposits);

router.post("/deposits/:id/approve", approveDeposit);
router.post("/deposits/:id/reject", rejectDeposit);
router.get("/deposits/addresses", getDepositAddresses);
router.post("/deposits/addresses",upload.single("qrCode"), setDepositAddress);

// ------------------- Withdrawal Management -------------------
router.get("/withdrawals/pending", getPendingWithdrawals);
router.get("/withdrawals", getWithdrawals);

router.post("/withdrawals/:id/approve", approveWithdrawal);
router.post("/withdrawals/:id/reject", rejectWithdrawal);

// ------------------- Exchange Management -------------------
router.get("/exchanges/pending", getPendingExchanges);
router.get("/exchanges", getExchanges);

router.post("/exchanges/:id/approve", approveExchange);
router.post("/exchanges/:id/reject", rejectExchange);
router.get("/exchanges/rate", getExchangeRate);
router.post("/exchanges/rate", setExchangeRate);

export default router;
