import express from "express"
import { authMiddleware } from "../middleware/auth.js"
import {
  getBalance,
  addWalletAddress,
  getWalletAddresses,
  getWalletAddressByNetwork,
  deleteWalletAddress,
} from "../controllers/walletController.js"

const router = express.Router()

router.use(authMiddleware)

router.get("/balance", getBalance)
router.post("/address", addWalletAddress)
router.delete("/address/:id",deleteWalletAddress)
router.get("/addresses", getWalletAddresses)
router.get("/address/:network", getWalletAddressByNetwork)

export default router
