import express from "express";
const router = express.Router();

import {
  getCountries,
  postCountries,
  getCountry,
  putCountry,
  deleteCountry
} from "../controllers/countries.controller.js";

// GET ALL COUNTRIES
router.get("/", getCountries);

// CREATE COUNTRY
router.post("/", postCountries);

// GET COUNTRY BY ID
router.get("/:id", getCountry);

// UPDATE COUNTRY
router.put("/:id", putCountry);

// DELETE COUNTRY
router.delete("/:id", deleteCountry);

export default router;