
import express from "express";
const router = express.Router();

import {
  postDeal,
  getAllDeal,
  getDeal,
  putDeal,
  deleteDeal,
  updateDealStatus,
  getActiveDeals,
} from "../controllers/deals.controller.js";
import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";


//specific route deyman fo2 al crud 
router.get("/activedeals", authMiddleware,roleMiddleware("INVESTOR"), getActiveDeals); //for investor 


// Routes (usually for admins)
router.post("/", postDeal);
router.get("/", getAllDeal);
router.get("/:id", getDeal);
router.put("/:id", putDeal);
router.delete("/:id", deleteDeal);
router.put("/:id/decision",authMiddleware,roleMiddleware("ADMIN"),updateDealStatus);



export default router;
