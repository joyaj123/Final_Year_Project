import express from "express";
const router = express.Router();
import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";

import {
  getAllDistributions,
  postDistribution,
  getDistribution,
  putDistribution,
  deleteDistribution,
  createDistribution,
  getMyCompanyDistributions
} from "../controllers/distributions.controller.js";

router.get("/mydistributions" ,authMiddleware,roleMiddleware("BUSINESS_OWNER"), getMyCompanyDistributions) ; 
router.post("/createdistribution" ,authMiddleware,roleMiddleware("BUSINESS_OWNER"), createDistribution) ; 


router.get("/", getAllDistributions);
router.post("/", postDistribution);
router.get("/:id", getDistribution);
router.put("/:id", putDistribution);
router.delete("/:id", deleteDistribution);
router.post("/" , authMiddleware, roleMiddleware("BUSINESS_OWNER"),createDistribution) ; 


export default router;