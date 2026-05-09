import { useEffect, useMemo, useState } from "react";
import { meApi } from "../api/auth.api.js";
import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await meApi();
        setUser(data.user);
      } catch {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = ({ token, user: profile }) => {
    localStorage.setItem("token", token);
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
