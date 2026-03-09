import express from "express";
const router = express.Router();

import {
  getAllDistributions,
  postDistribution,
  getDistribution,
  putDistribution,
  deleteDistribution
} from "../controllers/distributions.controller.js";

router.get("/", getAllDistributions);
router.post("/", postDistribution);
router.get("/:id", getDistribution);
router.put("/:id", putDistribution);
router.delete("/:id", deleteDistribution);

export default router;