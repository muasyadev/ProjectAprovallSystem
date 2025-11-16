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

// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";

// import authRoutes from "./routes/auth.js";
// import studentRoutes from "./routes/students.js";
// import lecturerRoutes from "./routes/lecturers.js";
// import hodRoutes from "./routes/hod.js";

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(cookieParser());

// // ✅ Dynamically choose allowed origin
// const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

// app.use(
//   cors({
//     origin: allowedOrigin,
//     credentials: true,
//   })
// );

// // ✅ Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/student", studentRoutes);
// app.use("/api/lecturer", lecturerRoutes);
// app.use("/api/hod", hodRoutes);

// app.get("/api/health", (_, res) => res.json({ status: "OK" }));
// app.get("/", (_, res) => res.send("Backend is running ✅"));

// // // ✅ Export app for Vercel serverless function
// // export default app;

// // ✅ But allow local development via app.listen
// if (process.env.NODE_ENV !== "production") {
//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () =>
//     console.log(`🚀 Local server running on http://localhost:${PORT}`)
//   );
// }
