// controllers/lecturerController.js
import { supabase } from "../config/supabase.js";

// Fetch students under the category assigned to this lecturer
export const getMyStudents = async (req, res) => {
  try {
    const lecturerId = req.user.id; // from auth middleware

    // 1️⃣ Fetch lecturer data
    const { data: lecturerData, error: lecturerError } = await supabase
      .from("lecturers")
      .select("assigned_category")
      .eq("id", lecturerId)
      .single();

    if (lecturerError || !lecturerData) {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    const category = lecturerData.assigned_category;

    // 2️⃣ Fetch students in that category
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("*")
      .eq("project_category", category);

    if (studentsError) throw studentsError;

    res.status(200).json({ students, category });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
