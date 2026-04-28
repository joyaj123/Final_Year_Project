import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";
import express from "express";
const router=express.Router();
import{
    getAudit_Logs,
    getAudit_Log,
    postAudit_Log,
    deleteAudit_Log} from "../controllers/audit_Logs.controller.js";

router.get("/",getAudit_Logs);
router.get("/:id",getAudit_Log);
router.post("/audit",authMiddleware,roleMiddleware("ADMIN"),postAudit_Log);
router.delete("/:id",deleteAudit_Log);

export default router;