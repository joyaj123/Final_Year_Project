import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";
import express from "express";
const router = express.Router();

import {
  postDeal,
  getAllDeal,
  getDeal,
  putDeal,
  deleteDeal,
  getActiveDeals,
  createDeal,
  updateDealStatus,
  investInDeal,
  getCompanyDeals
} from "../controllers/deals.controller.js";

import { checkApproved } from "../middlewar/company.middlewar.js";

//specific route deyman fo2 al crud 
router.get("/activedeals", authMiddleware,roleMiddleware("INVESTOR"), getActiveDeals); //for investor 
router.post("/createDeal", authMiddleware, roleMiddleware("BUSINESS_OWNER"), checkApproved,createDeal);
router.put("/:id/decision",authMiddleware,roleMiddleware("ADMIN"),updateDealStatus);
router.get("/mydeals", authMiddleware, getCompanyDeals);
router.post("/:id/invest",authMiddleware,roleMiddleware("INVESTOR"),investInDeal);

// Routes (usually for admins)
router.post("/", postDeal);
router.get("/", getAllDeal);
router.get("/:id", getDeal);
router.put("/:id", putDeal);
router.delete("/:id", deleteDeal);

export default router;
