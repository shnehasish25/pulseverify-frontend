import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../utils/axios";
import { auth, provider } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/vault", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // User-friendly error mapping based on Firebase Auth error codes
  const getErrorMessage = (error) => {
    switch (error.code) {
      case "auth/invalid-email":
        return "The email address is invalid.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/email-already-in-use":
        return "An account already exists with this email.";
      case "auth/weak-password":
        return "Your password is too weak. Please use at least 6 characters.";
      case "auth/popup-closed-by-user":
        return "The login popup was closed before finishing.";
      default:
        return error.message || "An unexpected error occurred. Please try again.";
    }
  };

  const handleAuthSuccess = async (user, token) => {
    // AuthContext's onAuthStateChanged will pick up the token automatically.
    // But we still store it in localStorage for the axios interceptor.
    localStorage.setItem("token", token);
    try {
      await axios.post(
        "/api/auth/verify",
        { email: user.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.warn("Backend sync failed or not required:", err);
    }
    toast.success(`${isLogin ? "Welcome back" : "Account created"}! Redirecting...`);
    setTimeout(() => navigate("/vault"), 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please fill in all fields.");
    }

    setLoading(true);
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      const token = await userCredential.user.getIdToken();
      await handleAuthSuccess(userCredential.user, token);
    } catch (error) {
      console.error("Authentication failed:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Popup opened successfully, now set loading state
      setGoogleLoading(true);
      const token = await result.user.getIdToken();
      await handleAuthSuccess(result.user, token);
      setGoogleLoading(false);
    } catch (error) {
      if (error.code === 'auth/popup-blocked') {
        console.warn("Popup blocked. Redirecting to secure login...");
        toast.warn("Popup blocked. Redirecting to secure login...", { autoClose: 3000 });
        await signInWithRedirect(auth, provider);
        // Will not reach here because of page redirect
      } else {
        console.error("Google login failed:", error);
        toast.error(getErrorMessage(error));
        setGoogleLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      return toast.error("Please enter your email address first to reset your password.");
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Password reset failed:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-[Lexend,sans-serif] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo / Brand */}
        <div className="animate-fade-in-up flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/25 mb-5 animate-pulse-glow">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="white">
              <path d="M8 1L2 3.8v3.7C2 11 4.8 13.6 8 14.2c3.2-.6 6-3.2 6-6.7V3.8L8 1z" />
            </svg>
          </div>
          <h1 className="text-[24px] font-bold tracking-tight">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            {isLogin ? "Sign in to your PulseVerify account" : "Join PulseVerify today"}
          </p>
        </div>

        {/* Form card */}
        <div className="animate-fade-in-up stagger-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-[12px] font-medium text-zinc-400 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.com"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-medium text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPwd ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-zinc-800 border border-zinc-600 rounded accent-red-500"
                />
                <span className="text-[12px] text-zinc-500">Remember me</span>
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-[12px] text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  {resetLoading ? "Sending..." : "Forgot password?"}
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading || resetLoading}
              className="w-full py-3 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-[14px] font-semibold rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                isLogin ? "Sign in" : "Sign up"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-[11px] text-zinc-600 font-medium">OR</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Google Sign In */}
          <button 
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading || resetLoading}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 border border-zinc-700 hover:border-zinc-600 text-white text-[13px] font-medium rounded-xl transition-all duration-150 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </button>
        </div>

        {/* Footer link */}
        <p className="animate-fade-in-up stagger-3 text-center text-[12px] text-zinc-600 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            {isLogin ? "Get started free" : "Sign in instead"}
          </button>
        </p>

        {/* Back to home */}
        <div className="animate-fade-in-up stagger-4 text-center mt-4">
          <Link
            to="/"
            className="text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
