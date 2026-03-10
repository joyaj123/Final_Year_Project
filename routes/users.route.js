import express from "express";
const router = express.Router();

import {
  getAllUsers,
  getUser,
  postUser,
  putUser,
  deleteUser
} from "../controllers/users.controller.js";

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.post("/", postUser);
router.put("/:id", putUser);
router.delete("/:id", deleteUser);

export default router;