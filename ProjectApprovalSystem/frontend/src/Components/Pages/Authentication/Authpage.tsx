import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthPage.css";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required(),
  role: yup
    .mixed<"student" | "hod" | "lecturer">()
    .oneOf(["student", "hod", "lecturer"], "Role is required")
    .required("Role is required"),
});

type FormValues = yup.InferType<typeof schema>;
type DecodedUser = { role: string; email?: string; username?: string };

export default function AuthPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });
  // Fix the URL in your login function - use port 3000
  const login = async (credentials: FormValues) => {
    try {
      const API_URL = "http://localhost:3000/api/auth/login";
      console.log("🔐 Sending login request to:", API_URL);
      console.log("📤 Login data:", credentials);

      const response = await axios.post(API_URL, credentials, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Login response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Login API error:", error);
      if (axios.isAxiosError(error)) {
        console.error("📊 Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      throw error;
    }
  };
  useEffect(() => {
    // Test backend connection
    const testBackend = async () => {
      try {
        await axios.get("http://localhost:3000/api/health");
        console.log("Backend is connected");
      } catch (error) {
        console.error("Backend connection failed:", error);
        toast.error(
          "Cannot connect to server. Please make sure backend is running."
        );
      }
    };

    testBackend();

    // Check if already logged in
    const token = Cookies.get("token");
    if (token) {
      toast.success("You are already logged in!");
      redirectToDashboard(token);
    }
  }, []);

  const redirectToDashboard = (token: string) => {
    try {
      const user = jwtDecode<DecodedUser>(token);
      switch (user.role) {
        case "student":
          navigate("/student/dashboard");
          break;
        case "hod":
          navigate("/hod/dashboard");
          break;
        case "lecturer":
          navigate("/lecturer/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch {
      Cookies.remove("token");
    }
  };

  // const onSubmit = async (data: FormValues) => {
  //   console.log("Form submitted:", data);

  //   try {
  //     const res = await login(data);
  //     console.log("Login response:", res);

  //     if (!res.success) {
  //       toast.error(res.message || "Login failed");
  //       return;
  //     }

  //     if (!res.token) {
  //       toast.error("Login failed - no token received");
  //       return;
  //     }

  //     Cookies.set("token", res.token, { expires: 1 });
  //     toast.success("Login successful!");
  //     redirectToDashboard(res.token);
  //   } catch (err: unknown) {
  //     console.error("Login error:", err);
  //     if (axios.isAxiosError(err)) {
  //       const errorMessage = err.response?.data?.message || "Login failed";
  //       toast.error(errorMessage);
  //       console.log("Server response:", err.response?.data);
  //     } else {
  //       toast.error("Unexpected error occurred");
  //     }
  //   }
  // };

  const onSubmit = async (data: FormValues) => {
    console.log("📝 Form submitted with:", data);

    try {
      const res = await login(data);

      if (!res.success) {
        toast.error(res.message || "Login failed");
        return;
      }

      if (!res.token) {
        toast.error("Login failed - no token received");
        return;
      }

      Cookies.set("token", res.token, { expires: 1 });
      toast.success("Login successful!");
      redirectToDashboard(res.token);
    } catch (err: unknown) {
      console.error("💥 Submit error:", err);
      if (axios.isAxiosError(err)) {
        // Log the COMPLETE error response
        console.log("🔍 Full error object:", err);
        console.log("🔍 Error response data:", err.response?.data);
        console.log("🔍 Error response status:", err.response?.status);
        console.log("🔍 Error response headers:", err.response?.headers);

        if (err.response?.status === 401) {
          const errorMessage =
            err.response?.data?.message || "Invalid credentials";
          console.log("🔍 401 Error details:", {
            message: errorMessage,
            fullData: err.response.data,
          });
          toast.error(`Login failed: ${errorMessage}`);
        } else if (err.code === "ECONNREFUSED") {
          toast.error(
            "Cannot connect to server. Please check if backend is running."
          );
        } else {
          toast.error(err.response?.data?.message || "Login failed");
        }
      } else {
        toast.error("Unexpected error occurred");
      }
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Login</h2>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <input type="email" placeholder="Email" {...register("email")} />
          {errors.email && (
            <div className="error-message">{errors.email.message}</div>
          )}

          <input
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <div className="error-message">{errors.password.message}</div>
          )}

          <select {...register("role")}>
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="hod">hod</option>
            <option value="lecturer">Lecturer</option>
          </select>
          {errors.role && (
            <div className="error-message">{errors.role.message}</div>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
