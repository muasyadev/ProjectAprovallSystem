// import {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   type ReactNode,
// } from "react";
// import { authAPI } from "../services/authapi";

// interface User {
//   id: string;
//   email: string;
//   username?: string;
// }

// interface Credentials {
//   email: string;
//   password: string;
// }

// interface AuthResponse {
//   success: boolean;
//   token?: string;
//   user?: User;
//   message?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (credentials: Credentials) => Promise<AuthResponse>;
//   logout: () => void;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   const checkAuth = async () => {
//     const token = localStorage.getItem("token");
//     if (!token) return setLoading(false);
//     try {
//       const res = await authAPI.verifyToken(token);
//       if (res.data.success) {
//         setUser(res.data.user ?? null); // ✅ fixed type issue
//       }
//     } catch {
//       localStorage.removeItem("token");
//     } finally {
//       setLoading(false);
//     }
//     console.log(token);
//   };

//   const login = async (credentials: Credentials): Promise<AuthResponse> => {
//     const res = await authAPI.login(credentials);
//     if (res.data.success && res.data.token) {
//       localStorage.setItem("token", res.data.token);
//       setUser(res.data.user ?? null);
//       console.log(res.data.token);
//       // ✅ fixed type issue
//     }
//     return res.data;
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Move the hook to a new file if ESLint keeps complaining about fast refresh
// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
//   return ctx;
// };

import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { authAPI } from "../services/authapi";

interface User {
  id: string;
  email: string;
  username?: string;
}

interface Credentials {
  email: string;
  password: string;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ On app load, check if backend cookie is valid
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authAPI.getProfile(); // GET /api/auth/me
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ✅ Login request (backend sets cookie)
  const login = async (credentials: Credentials): Promise<AuthResponse> => {
    const res = await authAPI.login(credentials); // POST /api/auth/login
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  // ✅ Logout request (backend clears cookie)
  const logout = async () => {
    await authAPI.logout(); // POST /api/auth/logout
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
