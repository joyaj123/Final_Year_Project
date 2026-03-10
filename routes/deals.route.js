
import express from "express";
const router = express.Router();

import {
  postDeal,
  getAllDeal,
  getDeal,
  putDeal,
  deleteDeal
} from "../controllers/deals.controller.js";

// Routes
router.post("/", postDeal);
router.get("/", getAllDeal);
router.get("/:id", getDeal);
router.put("/:id", putDeal);
router.delete("/:id", deleteDeal);

export default router;
