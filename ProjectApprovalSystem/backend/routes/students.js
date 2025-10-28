// backend/routes/students.js
import express from "express";
import multer from "multer";
import {
  getStudentData,
  enrollInProject,
  submitProposal,
  submitDocumentation,
} from "../controllers/studentController.js";
import { authMiddleware } from "../middleware/auth.js";
import { supabase } from "../config/supabase.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Protected routes
router.get("/me", authMiddleware, getStudentData);
router.post("/enroll", authMiddleware, enrollInProject);
router.post(
  "/submit-proposal",
  authMiddleware,
  upload.single("file"),
  submitProposal
);
router.post(
  "/submit-documentation",
  authMiddleware,
  upload.single("file"),
  submitDocumentation
);

// 🔧 Test connection (no auth)
router.get("/test-connection", async (req, res) => {
  try {
    console.log("🔍 Testing Supabase connection to students table...");

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .limit(1);

    if (error) {
      console.log("❌ Supabase connection error:", error);
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: error.message,
      });
    }

    console.log("✅ Supabase connected successfully!");
    res.json({
      success: true,
      message: "Database connected successfully",
      sampleData: data,
    });
  } catch (err) {
    console.error("❌ Connection test failed:", err);
    res.status(500).json({
      success: false,
      message: "Connection test failed",
      error: err.message,
    });
  }
});

export default router;
