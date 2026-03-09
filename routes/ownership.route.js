import express from "express";
const router=express.Router();
import{
    getOwnerships,
    getOwnership,
    postOwnership,
    deleteOwnership} from "../controllers/ownership.controller.js";

router.get("/",getOwnerships);
router.get("/:id",getOwnership);
router.post("/",postOwnership);
router.delete("/:id",deleteOwnership);

export default router;