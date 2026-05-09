import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/HomePage";
import RoomPage from "../pages/RoomPage";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/useAuth.js";

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/room/:roomId"
        element={
          <ProtectedRoute>
            <RoomPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/auth"} replace />} />
    </Routes>
  );
}
