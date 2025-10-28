import express from "express";
import { assignLecturer } from "../controllers/hodController.js";

const router = express.Router();

// ✅ Route for assigning a lecturer
router.post("/assign-lecturer", assignLecturer);

export default router;
