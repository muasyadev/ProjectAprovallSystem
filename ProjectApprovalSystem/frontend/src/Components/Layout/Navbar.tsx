import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface User {
  role: string;
  email: string;
}

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/login");
  };

  return (
    <nav>
      <div>
        Welcome, {user.email} ({user.role})
      </div>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
