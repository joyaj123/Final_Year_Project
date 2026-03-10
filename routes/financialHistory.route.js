import express from "express";
const router = express.Router();

import {
  getAllFinancialHistories,
  createFinancialHistory,
  getFinancialHistoryById,
  updateFinancialHistory,
  deleteFinancialHistory
} from "../controllers/financialHistory.controller.js";

router.get("/", getAllFinancialHistories);
router.post("/", createFinancialHistory);
router.get("/:id", getFinancialHistoryById);
router.put("/:id", updateFinancialHistory);
router.delete("/:id", deleteFinancialHistory);

export default router;
