// src/Components/Layout/Layout.tsx
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface User {
  role: string;
  email: string;
}

export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode<User>(token);
      setUser(decoded);
    } catch {
      Cookies.remove("token");
      navigate("/login");
    }
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="layout">
      <Navbar user={user} />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
