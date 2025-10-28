// src/App.tsx or router configuration
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Authpage from "./Components/Pages/Authentication/Authpage";
import Layout from "./Components/Layout/Layout";
import StudentDashboard from "./Components/Pages/Student/StudentDashboard";
import HodDashboard from "./Components/Pages/Hod/HodDashboard";
import LecturerDashboard from "./Components/Pages/Lecturer/LecturerDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Authpage />} />

          {/* Protected routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route path="student/dashboard" element={<StudentDashboard />} />
            <Route path="hod/dashboard" element={<HodDashboard />} />
            <Route path="lecturer/dashboard" element={<LecturerDashboard />} />
            <Route index element={<Navigate to="/login" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
