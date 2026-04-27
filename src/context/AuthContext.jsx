import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, getRedirectResult } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and provides:
 *   user          – Firebase User object (or null)
 *   token         – current JWT string  (or null)
 *   loading       – true while Firebase resolves auth state
 *   isAuthenticated – convenience boolean
 *   logout()      – signs out and clears token
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;
    let isMounted = true;

    const checkRedirectAndListen = async () => {
      try {
        // 1. Process any pending redirect from Google Sign-In first.
        // This ensures loading stays true until Firebase finishes the redirect loop.
        const result = await getRedirectResult(auth);
        
        if (result && result.user && isMounted) {
          const idToken = await result.user.getIdToken();
          localStorage.setItem("token", idToken);
          setToken(idToken);
          setUser(result.user);
          // React Router (via LoginPage) will automatically handle the redirect
          // to /vault once onAuthStateChanged sets loading to false.
        }
      } catch (error) {
        console.error("Firebase redirect result error:", error);
      }

      // 2. Now that the redirect is resolved, listen to steady-state changes.
      if (isMounted) {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            const idToken = await firebaseUser.getIdToken();
            localStorage.setItem("token", idToken);
            setToken(idToken);
            setUser(firebaseUser);
          } else {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          }
          // Only drop the loading curtain after we know the true state
          setLoading(false);
        });
      }
    };

    checkRedirectAndListen();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Proactively refresh the token every 50 minutes (Firebase tokens expire
  // at 60 min). This keeps API calls working in long-lived sessions.
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const freshToken = await user.getIdToken(true);
        localStorage.setItem("token", freshToken);
        setToken(freshToken);
      } catch (err) {
        console.warn("Token refresh failed:", err);
      }
    }, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to consume auth state from any component. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export default AuthContext;
