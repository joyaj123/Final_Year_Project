import express from "express";
const router = express.Router();
import {
  getAllTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction
} from "../controllers/transaction.controller.js";

router.get("/", getAllTransactions);
router.post("/", createTransaction);
router.get("/:id", getTransactionById);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;