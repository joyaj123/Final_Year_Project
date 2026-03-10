import express from "express";
const router = express.Router();

import {
  getAllSectors,
  createSector,
  getSectorById,
  updateSector,
  deleteSector
} from "../controllers/sector.controller.js";

router.get("/", getAllSectors);
router.post("/", createSector);
router.get("/:id", getSectorById);
router.put("/:id", updateSector);
router.delete("/:id", deleteSector);

export default router;
