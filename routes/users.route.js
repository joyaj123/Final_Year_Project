import express from "express";
import { authMiddleware } from "../middlewar/authMiddlewar.js";
import { roleMiddleware } from "../middlewar/roleMiddleware.js";

const router = express.Router();

import {
  getAllUsers,
  getUser,
  postUser,
  putUser,
  deleteUser,
  loginUser,
  registerUser,
  resetPassword,
  forgotPassword,
  getMyProfile

} from "../controllers/users.controller.js";



//LOGIN AND REGISTER
router.get("/me", authMiddleware, getMyProfile);
router.post("/login",loginUser) ; //If someone sends POST /login → run loginUser() 
router.post("/register",registerUser) ; 


//PASSWORD MANAGEMENT
router.post('/forgot-password', forgotPassword); // send OTP
router.post('/reset-password', resetPassword);   // verify OTP + new password



//BASIC CRUD 
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.post("/", postUser);
router.put("/:id", putUser);
router.delete("/:id", deleteUser);






//no middleware on login and signup 
export default router;

