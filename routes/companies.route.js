import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";
import express from "express";
const router=express.Router();
import {
    getCompanies,
    getCompany,
    postCompany,
    updateCompany,
    deleteCompany,
    listing} from "../controllers/company.controller.js";
    
router.post("/listing", authMiddleware, roleMiddleware("BUSINESS_OWNER"), listing);

router.get('/',getCompanies);
router.get("/:id",getCompany);
router.post("/",postCompany);
router.put("/:id",updateCompany);
router.delete("/:id",deleteCompany);

export default router;