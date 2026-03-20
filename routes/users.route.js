import express from "express";
import { authMiddleware } from "../middlewar/authMiddlewar.js";
const router = express.Router();

import {
  getAllUsers,
  getUser,
  postUser,
  putUser,
  deleteUser,
  loginUser,
  registerUser
  resetPassword,
  forgotPassword

} from "../controllers/users.controller.js";


//BASIC CRUD 
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.post("/", postUser);
router.put("/:id", putUser);
router.delete("/:id", deleteUser);
router.post("/login",loginUser) ;//If someone sends POST /login → run loginUser() 
router.post("/register",registerUser)


//LOGIN
router.post("/login",loginUser) ; //If someone sends POST /login → run loginUser() 

//PASSWORD MANAGEMENT
router.post('/forgot-password', forgotPassword); // send OTP
router.post('/reset-password', resetPassword);   // verify OTP + new password



//no middleware on login and signup 
export default router;

