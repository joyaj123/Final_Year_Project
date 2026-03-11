import express from "express";
const router = express.Router();

import {
  getAllUsers,
  getUser,
  postUser,
  putUser,
  deleteUser,
  loginUser
} from "../controllers/users.controller.js";

router.get("/", getAllUsers);
router.get("/:id", getUser);
router.post("/", postUser);
router.put("/:id", putUser);
router.delete("/:id", deleteUser);
router.post("/login", loginUser) ; //If someone sends POST /login → run loginUser() 

export default router;