import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <main className="min-h-screen grid place-items-center">Loading...</main>;
  }
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}
