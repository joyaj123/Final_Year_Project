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
   reviewCompany,
    getMyCompany,
    listing,
    getMyWallet} from "../controllers/company.controller.js";
    
router.post("/listing", authMiddleware, roleMiddleware("BUSINESS_OWNER"), listing);
router.get("/mywallet",authMiddleware,roleMiddleware("BUSINESS_OWNER", "INVESTOR"),getMyWallet); ////////// ROUTE

router.put("/:id/decision",authMiddleware,roleMiddleware("ADMIN"),reviewCompany);

router.get('/',getCompanies);
router.get("/:id",getCompany);
router.post("/",postCompany);
router.put("/:id",updateCompany);
router.delete("/:id",deleteCompany);
router.get("/my-company", authMiddleware,roleMiddleware("BUSINESS_OWNER") ,  getMyCompany); /////////// GET COMPANY DATA FOR PREFILL/PREVIEW


export default router;