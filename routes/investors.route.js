import { authMiddleware } from "../middlewar/authMiddlewar.js";
import express from "express";
const router = express.Router();

import {
    getAllInvestors,
    createInvestor,
    getInvestorById,
    updateInvestor,
    deleteInvestor,
    onboarding} from "../controllers/investor.controller.js";

router.get("/", getAllInvestors);
router.get("/:id", getInvestorById);
router.post("/", createInvestor);
router.put("/:id", updateInvestor);
router.delete("/:id", deleteInvestor);
router.post("/onboarding", authMiddleware, onboarding);

export default router;
