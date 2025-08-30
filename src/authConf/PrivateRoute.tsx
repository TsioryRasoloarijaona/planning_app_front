import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Me } from "@/authConf/getMe";

type Role = Me["role"]; 

export function PrivaRoute({ roles }: { roles?: Role[] }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <div style={{ padding: 24 }}>Chargement…</div>;
  }

  if (status === "unauthenticated" || !user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === "ADMIN" ? "/admin" : "/user";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
