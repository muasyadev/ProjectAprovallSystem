// import { supabase } from "../config/supabase.js";

// // Assign or add a lecturer
// export const assignLecturer = async (req, res) => {
//   try {
//     const { name, email, projectCategory } = req.body;

//     console.log("📩 Received data from frontend:", req.body);

//     if (!name || !email || !projectCategory) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     // Check if lecturer already exists
//     const { data: existingLecturer, error: selectError } = await supabase
//       .from("lecturers")
//       .select("*")
//       .eq("email", email)
//       .single();

//     if (selectError && selectError.code !== "PGRST116") {
//       return res.status(500).json({ message: "Error checking lecturer." });
//     }

//     if (existingLecturer) {
//       // Update existing lecturer's project category
//       const { data, error: updateError } = await supabase
//         .from("lecturers")
//         .update({ name, project_category: projectCategory })
//         .eq("email", email)
//         .select()
//         .single();

//       if (updateError) {
//         return res.status(500).json({ message: "Failed to update lecturer." });
//       }

//       return res.status(200).json({
//         message: `Lecturer ${name} reassigned to ${projectCategory} successfully.`,
//         lecturer: data,
//       });
//     }

//     // Insert new lecturer
//     const { data, error: insertError } = await supabase
//       .from("lecturers")
//       .insert([{ name, email, project_category: projectCategory }])
//       .select()
//       .single();

//     if (insertError) {
//       return res.status(500).json({ message: "Failed to assign lecturer." });
//     }

//     res.status(201).json({
//       message: `Lecturer ${name} assigned to ${projectCategory} successfully.`,
//       lecturer: data,
//     });
//   } catch (error) {
//     console.error("❌ Error assigning lecturer:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// // // Get all lecturers
// // export const getAllLecturers = async (req, res) => {
// //   try {
// //     const { data, error } = await supabase
// //       .from("lecturers")
// //       .select("*")
// //       .order("name", { ascending: true });

// //     if (error) {
// //       return res.status(500).json({ message: "Failed to fetch lecturers." });
// //     }

// //     res.status(200).json(data);
// //   } catch (error) {
// //     console.error("❌ Error fetching lecturers:", error);
// //     res.status(500).json({ message: "Internal server error." });
// //   }
// // };

import { supabase } from "../config/supabase.js";

export const assignLecturer = async (req, res) => {
  try {
    const { name, email, projectCategory } = req.body;

    // Validate input
    if (!name || !email || !projectCategory) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if lecturer already exists
    const { data: existing, error: fetchError } = await supabase
      .from("lecturers")
      .select("*")
      .eq("lecturer_email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // Supabase fetch error
      return res.status(500).json({ message: fetchError.message });
    }

    if (existing) {
      return res.status(400).json({ message: "Lecturer already exists." });
    }

    // Insert new lecturer
    const { data, error: insertError } = await supabase
      .from("lecturers")
      .insert([
        {
          lecturer_username: name,
          lecturer_email: email,
          category: projectCategory,
        },
      ])
      .select(); // Select returns the inserted row

    if (insertError) {
      return res.status(500).json({ message: insertError.message });
    }

    res.status(201).json({
      message: `Lecturer ${name} assigned to ${projectCategory} successfully.`,
      lecturer: data[0],
    });
  } catch (err) {
    console.error("❌ Error assigning lecturer:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
