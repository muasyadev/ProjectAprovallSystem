// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import authRoutes from "./routes/auth.js";
// import studentRoutes from "./routes/students.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true,
//   })
// );
// app.use(express.json());

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/student", studentRoutes);

// // Health check
// app.get("/api/health", (req, res) => {
//   res.json({ message: "Server is running!" });
// });

// // Basic 404 handler without wildcard
// app.use((req, res) => {
//   if (req.path !== "/api/health" && !req.path.startsWith("/api/auth")) {
//     res.status(404).json({
//       success: false,
//       message: "Route not found",
//     });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
// });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import lecturerRoutes from "./routes/lecturers.js";
import hodRoutes from "./routes/hod.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // if using Vite
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/hod", hodRoutes);

app.get("/api/health", (_, res) => res.json({ status: "OK" }));
app.get("/", (_, res) => res.send("backend is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
