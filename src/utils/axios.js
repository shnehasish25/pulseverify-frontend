import axios from "axios";
import { toast, Bounce } from "react-toastify";

// ── Axios instance for all PulseVerify API calls ────────────────────────────
// Set VITE_API_URL in .env (dev) or Vercel environment variables (prod).
// Example: VITE_API_URL=https://pulseverify.onrender.com
const API = import.meta.env.VITE_API_URL;
console.log("API BASE URL:", API);

const instance = axios.create({
  baseURL: API,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor ─────────────────────────────────────────────────────
// Attaches the Firebase JWT stored in localStorage after login.
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ────────────────────────────────────────────────────
// Suppress toast errors for 401 when there's no token (user simply isn't
// logged in yet). This prevents the "Session expired" spam on first load.
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hasToken = !!localStorage.getItem("token");

    // If 401 and user never logged in → don't show a toast, it's expected
    if (status === 401 && !hasToken) {
      return Promise.reject(error);
    }

    const messages = {
      401: "Session expired — please log in again.",
      403: "Access denied.",
      404: "Resource not found.",
    };

    if (status) {
      toast.error(messages[status] ?? "Something went wrong!", {
        transition: Bounce,
        position: "bottom-right",
        theme: "dark",
        toastId: `api-error-${status}`,
      });
    } else if (error.code === "ECONNABORTED") {
      toast.error("Request timed out. Is the backend running?", {
        transition: Bounce,
        position: "bottom-right",
        theme: "dark",
        toastId: "timeout-error",
      });
    } else if (!error.response) {
      toast.error("Cannot connect to the server. Please start the backend.", {
        transition: Bounce,
        position: "bottom-right",
        theme: "dark",
        toastId: "network-error",
      });
    }

    return Promise.reject(error);
  }
);

export default instance;
