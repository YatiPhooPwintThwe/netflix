import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  signup,
  logout,
  login,
  forgotPassword,
  verifyEmail,
  resetPassword,
  checkAuth,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/logout", logout);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-email", verifyEmail);
router.post("/reset-password/:token", resetPassword);
router.get("/check-auth", protectRoute, checkAuth);

export default router;
