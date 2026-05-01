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
import { checkApproved } from "../middlewar/company.middlewar.js";


router.get("/mytransactions", authMiddleware, roleMiddleware("BUSINESS_OWNER","INVESTOR"),getMyTransactions); ////////// ROUTE
router.post(
  "/withdraw",
  authMiddleware,
  roleMiddleware("BUSINESS_OWNER", "INVESTOR"),
  checkApproved,
  withdrawFromWallet
);

router.post(
  "/deposit",
  authMiddleware,checkApproved,
  roleMiddleware("BUSINESS_OWNER", "INVESTOR"),
  depositToWallet
); ////////// ROUTE


router.post("/deposit", authMiddleware, roleMiddleware("INVESTOR"), depositToWallet);
router.post("/withdraw", authMiddleware, roleMiddleware("INVESTOR"), withdrawFromWallet);

router.get("/", getAllTransactions);
router.post("/", createTransaction);
router.get("/:id", getTransactionById);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;