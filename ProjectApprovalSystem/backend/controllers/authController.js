import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";

export const login = async (req, res) => {
  console.log("🔐 LOGIN CONTROLLER HIT!");

  try {
    const { email, password, role } = req.body;

    console.log("📧 Login attempt for:", email);
    console.log("🔑 Password received:", password);

    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
    }

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("👤 User found. Stored password:", user.password_hash);

    // Simple plain text comparison
    const isPasswordValid = password === user.password_hash;
    console.log("🔑 Plain text comparison result:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Verify role
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Access denied for this role",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "24h" }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
    console.log("✅ Login successful!");

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("💥 Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const register = async (req, res) => {
  console.log("🔐 REGISTER CONTROLLER HIT!");
  console.log("📦 Request body:", req.body);

  try {
    const { email, password, role, username } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    console.log("🔑 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("🔑 Password hashed successfully");

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase(),
          username: username || email.split("@")[0],
          password_hash: hashedPassword,
          role: role,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Database error:", error);
      throw error;
    }

    console.log("✅ User created successfully:", user.email);
    // ✅ AUTO-ADD LECTURER LOGIC
    if (user.role === "lecturer") {
      console.log("👨‍🏫 Checking lecturer table for:", user.email);

      const { data: existingLecturer, error: checkError } = await supabase
        .from("lecturers")
        .select("*")
        .eq("lecturer_email", user.email)
        .maybeSingle();

      if (checkError) {
        console.error("⚠️ Lecturer fetch error:", checkError);
      }

      if (!existingLecturer) {
        console.log(
          "🧩 Lecturer not found in 'lecturers' table — inserting..."
        );

        const { error: insertError } = await supabase.from("lecturers").insert([
          {
            lecturer_email: user.email,
            lecturer_username: user.username,
            category: "Unassigned", // default until HOD assigns
          },
        ]);

        if (insertError) {
          console.error("❌ Error inserting lecturer:", insertError);
        } else {
          console.log("✅ Lecturer successfully added to 'lecturers' table!");
        }
      } else {
        console.log("✅ Lecturer already exists in DB");
      }
    }
    // Generate JWT token for new user
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("💥 Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};
