import express from "express";
import { authMiddleware } from "../middlewar/authMiddlewar.js";
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
router.post("/login",loginUser) ; //If someone sends POST /login → run loginUser() 
//no middleware on login and signup 
export default router;

