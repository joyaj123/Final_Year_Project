import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";
import express from "express";
const router = express.Router();
import {
  getAllTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  depositToWallet,
  withdrawFromWallet
} from "../controllers/transaction.controller.js";


router.post("/deposit", authMiddleware, roleMiddleware("INVESTOR"), depositToWallet);
router.post("/withdraw", authMiddleware, roleMiddleware("INVESTOR"), withdrawFromWallet);

router.get("/", getAllTransactions);
router.post("/", createTransaction);
router.get("/:id", getTransactionById);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;