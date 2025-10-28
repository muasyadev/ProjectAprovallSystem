// routes/lecturer.js
import express from "express";
import { getMyStudents } from "../controllers/lecturerController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET /api/lecturer/my-students
router.get("/my-students", async (req, res) => {
  try {
    // Assuming you know the lecturer's ID from the session
    const lecturerId = req.user.id; // from auth middleware
    const { data: categoryData, error: catError } = await supabase
      .from("lecturers")
      .select("assigned_category")
      .eq("id", lecturerId)
      .single();

    if (catError) throw catError;

    const { data: students, error: stuError } = await supabase
      .from("students")
      .select("*")
      .eq("project_category", categoryData.assigned_category);

    if (stuError) throw stuError;

    res.status(200).json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
