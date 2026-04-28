import express from "express";
const router = express.Router();
import {
  getAllTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getMyTransactions,
  withdrawFromWallet,
  depositToWallet
} from "../controllers/transaction.controller.js";
import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";


router.get("/mytransactions", authMiddleware, roleMiddleware("BUSINESS_OWNER","INVESTOR"),getMyTransactions); ////////// ROUTE
router.post(
  "/withdraw",
  authMiddleware,
  roleMiddleware("BUSINESS_OWNER", "INVESTOR"),
  withdrawFromWallet
);

router.post(
  "/deposit",
  authMiddleware,
  roleMiddleware("BUSINESS_OWNER", "INVESTOR"),
  depositToWallet
); ////////// ROUTE

router.get("/", getAllTransactions);
router.post("/", createTransaction);
router.get("/:id", getTransactionById);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;