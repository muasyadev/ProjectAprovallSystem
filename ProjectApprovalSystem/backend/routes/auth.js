import express from "express";
import {
  login,
  register,
  // verifyToken,
  // logout,
  // getProfile,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Login route
router.post("/login", login);

// Add debug route to test if routes are working
router.get("/debug", (req, res) => {
  console.log("✅ Debug route hit!");
  res.json({
    success: true,
    message: "Auth routes are working!",
    timestamp: new Date().toISOString(),
  });
});

// Other routes
router.post("/register", register);
// router.post("/verify", verifyToken);
// router.post("/logout", logout);
// router.get("/profile", authMiddleware, getProfile);

export default router;
