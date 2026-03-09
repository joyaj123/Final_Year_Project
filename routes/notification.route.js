import express from "express";
const router=express.Router();
import{
    getNotifications,
    getNotification,
    postNotification,
    updateNotification,
    deleteNotification,} from "../controllers/notification.controller.js";

router.get('/',getNotifications);
router.get("/:id",getNotification);
router.post("/",postNotification);
router.put("/:id",updateNotification);
router.delete("/:id",deleteNotification);




export default router;