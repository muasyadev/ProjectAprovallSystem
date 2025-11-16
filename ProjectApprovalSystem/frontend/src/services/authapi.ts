import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Define types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

interface ProfileResponse {
  success: boolean;
  user: User;
}

// Create axios instance with proper typing
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor with proper typing
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor with proper typing
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API methods with proper typing
export const authAPI = {
  login: (
    credentials: LoginCredentials
  ): Promise<AxiosResponse<AuthResponse>> =>
    api.post<AuthResponse>("/auth/login", credentials),

  register: (userData: RegisterData): Promise<AxiosResponse<AuthResponse>> =>
    api.post<AuthResponse>("/auth/register", userData),

  verifyToken: (token: string): Promise<AxiosResponse<AuthResponse>> =>
    api.post<AuthResponse>("/auth/verify", { token }),

  logout: (): Promise<AxiosResponse<AuthResponse>> =>
    api.post<AuthResponse>("/auth/logout"),

  getProfile: (): Promise<AxiosResponse<ProfileResponse>> =>
    api.get<ProfileResponse>("/auth/profile"),
};

export default api;
