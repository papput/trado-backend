import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { depositUSDT, withdrawUSDT, getDepositHistory, getWithdrawHistory, getExchangeHistory, exchangeUSDT, addBankCard, getBankCards, deleteBankCard, confirmDeposit, cancelDeposit, } from "../controllers/transactionController.js";
import { getExchangeRate } from "../controllers/exchangeController.js";
const router = express.Router();
router.use(authMiddleware);
router.post("/deposit", depositUSDT);
router.post("/deposit/confirm", confirmDeposit); // TxId submission
router.post("/cancel-deposit", cancelDeposit);
router.get("/exchanges/rate", getExchangeRate);
router.post("/withdraw", withdrawUSDT);
router.post("/exchange", exchangeUSDT);
router.get("/deposit-history", getDepositHistory);
router.get("/withdraw-history", getWithdrawHistory);
router.get("/exchange-history", getExchangeHistory);
router.post("/add-bank-card", addBankCard);
router.get("/bank-cards", getBankCards);
router.delete("/delete-bank-card/:account", deleteBankCard);
export default router;
