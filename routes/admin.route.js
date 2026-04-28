import express from "express";
import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";
import { getDashboardStats } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/stats",authMiddleware,roleMiddleware("ADMIN"),getDashboardStats);

export default router;