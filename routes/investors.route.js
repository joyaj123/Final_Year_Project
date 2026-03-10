import express from "express";
const router = express.Router();

import {
  getAllInvestors,
  createInvestor,
  getInvestorById,
  updateInvestor,
  deleteInvestor
} from "../controllers/investor.controller.js";

router.get("/", getAllInvestors);
router.get("/:id", getInvestorById);
router.post("/", createInvestor);
router.put("/:id", updateInvestor);
router.delete("/:id", deleteInvestor);

export default router;
