import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";
import express from "express";
const router = express.Router();

import {
    getAllInvestors,
    createInvestor,
    getInvestorById,
    updateInvestor,
    deleteInvestor,
    onboarding,
   reviewKyc} from "../controllers/investor.controller.js";

router.post("/onboarding", authMiddleware, roleMiddleware("INVESTOR"), onboarding);
router.put("/:id/decision",authMiddleware,roleMiddleware("ADMIN"),reviewKyc);

router.get("/", getAllInvestors);
router.get("/:id", getInvestorById);
router.post("/", createInvestor);
router.put("/:id", updateInvestor);
router.delete("/:id", deleteInvestor);

export default router;
