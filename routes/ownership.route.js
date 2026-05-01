import express from "express";
import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";
const router=express.Router();
import{
    getOwnerships,
    getOwnership,
    getPortfolio,
    postOwnership,
    deleteOwnership,} from "../controllers/ownership.controller.js";

router.get("/portfolio",authMiddleware,roleMiddleware("INVESTOR"),getPortfolio);
router.get("/",getOwnerships);
router.get("/:id",getOwnership);
router.post("/",postOwnership);
router.delete("/:id",deleteOwnership);

export default router;