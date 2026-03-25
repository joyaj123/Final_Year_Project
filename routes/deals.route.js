import { authMiddleware } from "../middlewar/authMiddlewar.js";
import express from "express";
const router = express.Router();

import {
  postDeal,
  getAllDeal,
  getDeal,
  putDeal,
  deleteDeal,
  createDeal
} from "../controllers/deals.controller.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";

// Routes
router.get("/",postDeal);
router.get("/", getAllDeal);
router.get("/:id", getDeal);
router.put("/:id", putDeal);
router.delete("/:id", deleteDeal);
router.post("/createDeal", authMiddleware, roleMiddleware("BUSINESS_OWNER"), createDeal);


export default router;
