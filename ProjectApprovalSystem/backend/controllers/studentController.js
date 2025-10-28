// backend/controllers/studentController.js

import fs from "fs";
import { supabase } from "../config/supabase.js";

// ✅ Get student data (on login or dashboard load)
export const getStudentData = async (req, res) => {
  try {
    const { email } = req.user; // Comes from auth middleware (decoded JWT)

    console.log("🔍 BACKEND: Fetching student data for:", email);

    const { data, error } = await supabase
      .from("students")
      .select(
        "project_name, project_category, enrollment_status, progress_tracker"
      )
      .eq("student_email", email)
      .single();

    if (error && error.code === "PGRST116") {
      console.log("📭 No enrollment found for:", email);
      return res.json({
        success: true,
        studentData: null,
        message: "No enrollment found",
      });
    }

    if (error) {
      console.error("❌ Error querying student data:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching student data",
      });
    }

    console.log("✅ Student data found:", data);
    return res.json({ success: true, studentData: data });
  } catch (err) {
    console.error("❌ Exception in getStudentData:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ✅ Enroll student in project
export const enrollInProject = async (req, res) => {
  try {
    const { email, username } = req.user;
    const { projectTitle, projectCategory } = req.body;

    console.log("🎓 Enrollment request for:", email);
    console.log("📝 Project:", projectTitle, projectCategory);

    // Check if already enrolled
    const { data: existing, error: existingErr } = await supabase
      .from("students")
      .select("project_name")
      .eq("student_email", email)
      .maybeSingle(); // ✅ use maybeSingle to avoid hard errors if no rows

    if (existingErr) {
      console.error("❌ Error checking existing enrollment:", existingErr);
      return res.status(500).json({
        success: false,
        message: "Error checking enrollment",
      });
    }

    if (existing && existing.project_name) {
      console.log("🚫 Already enrolled:", existing.project_name);
      return res.status(400).json({
        success: false,
        message: `You are already enrolled in: ${existing.project_name}.`,
      });
    }

    // Proceed with enrollment
    const { data, error } = await supabase
      .from("students")
      .upsert(
        {
          student_email: email,
          student_username: username || email.split("@")[0],
          project_name: projectTitle,
          project_category: projectCategory,
          enrollment_status: "enrolled",
          progress_tracker: {
            enrollment: true,
            proposal_submitted: false,
            proposal_approved: false,
            documentation_uploaded: false,
            final_submission: false,
          },
          enrolled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "student_email" } // ✅ ensures one record per student
      )
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase upsert error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to enroll student",
      });
    }

    console.log("✅ Enrollment successful:", data);
    return res.json({
      success: true,
      message: "Successfully enrolled in project!",
      studentData: data,
    });
  } catch (err) {
    console.error("❌ Exception in enrollInProject:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Submit proposal
export const submitProposal = async (req, res) => {
  try {
    const { email } = req.user;
    const { title, description } = req.body;
    const file = req.file; // multer adds this

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    console.log("📄 Proposal upload for:", email);
    console.log("File path:", file.path);

    // Fetch current tracker
    const { data: currentData } = await supabase
      .from("students")
      .select("progress_tracker")
      .eq("student_email", email)
      .single();

    // Update DB with proposal info
    const { data, error } = await supabase
      .from("students")
      .update({
        proposal_title: title,
        proposal_description: description,
        proposal_doc_path: file.path, // saved locally or to cloud later
        progress_tracker: {
          ...currentData.progress_tracker,
          proposal_submitted: true,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("student_email", email)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Proposal uploaded successfully for:", email);
    res.json({
      success: true,
      message: "Proposal uploaded successfully!",
      studentData: data,
    });
  } catch (error) {
    console.error("❌ Proposal submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload proposal",
    });
  }
};

// Upload documentation
export const submitDocumentation = async (req, res) => {
  try {
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Upload file to Supabase storage
    const filePath = `documentation/${Date.now()}_${file.originalname}`;
    const { data, error } = await supabase.storage
      .from("student-documents")
      .upload(filePath, fs.createReadStream(file.path), {
        contentType: file.mimetype,
        duplex: "half",
      });

    if (error) {
      console.error("Upload error:", error);
      return res
        .status(500)
        .json({ success: false, message: "File upload failed", error });
    }

    // Store metadata in the database
    await supabase.from("documentation").insert([
      {
        student_id: req.user.id,
        document_type: documentType,
        file_url: filePath,
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Documentation uploaded successfully",
      fileUrl: filePath,
    });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update progress
export const updateProgress = async (req, res) => {
  try {
    const { email } = req.user;
    const { progressData } = req.body;

    console.log("📊 BACKEND: Progress update for:", email);

    const { data, error } = await supabase
      .from("students")
      .update({
        progress_tracker: progressData,
        updated_at: new Date().toISOString(),
      })
      .eq("student_email", email)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ BACKEND: Progress updated successfully");

    res.json({
      success: true,
      message: "Progress updated successfully!",
      studentData: data,
    });
  } catch (error) {
    console.error("❌ BACKEND: Progress update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
};
