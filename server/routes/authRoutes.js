import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

import {
  register,
  verifyOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  logout,
  getAllUsers
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);

router.post("/verify-otp", verifyOTP);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/verify-reset-otp", verifyResetOTP);

router.post("/reset-password", resetPassword);

router.post("/logout", logout);

router.get("/users", protect, adminOnly, getAllUsers);

export default router;
