import express from "express";
const router = express.Router();
import {
  getAllSubSectors,
  createSubSector,
  getSubSectorById,
  updateSubSector,
  deleteSubSector
} from "../controllers/subSector.controller.js";

router.get("/", getAllSubSectors);
router.post("/", createSubSector);
router.get("/:id", getSubSectorById);
router.put("/:id", updateSubSector);
router.delete("/:id", deleteSubSector);

export default router;
