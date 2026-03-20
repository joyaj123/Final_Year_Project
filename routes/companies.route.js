import { authMiddleware } from "../middlewar/authMiddlewar.js";
import express from "express";
const router=express.Router();
import {
    getCompanies,
    getCompany,
    postCompany,
    updateCompany,
    deleteCompany,
    listing} from "../controllers/company.controller.js";

router.get('/',getCompanies);
router.get("/:id",getCompany);
router.post("/",postCompany);
router.put("/:id",updateCompany);
router.delete("/:id",deleteCompany);
router.post("/listing", authMiddleware, listing);

export default router;