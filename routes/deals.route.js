
import express from "express";
const router = express.Router();

import {
  postDeal,
  getAllDeal,
  getDeal,
  putDeal,
  deleteDeal,
  updateDealStatus
} from "../controllers/deals.controller.js";
import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";

// Routes
router.post("/", postDeal);
router.get("/", getAllDeal);
router.get("/:id", getDeal);
router.put("/:id", putDeal);
router.delete("/:id", deleteDeal);
router.put("/:id/decision",authMiddleware,roleMiddleware("ADMIN"),updateDealStatus);

export default router;
