import type { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  /** Role yang boleh membuka route di dalamnya, contoh: ["admin"] */
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps): ReactElement => {
  const { session } = useAuth();
  const location = useLocation();

  const role = session?.role;

  // 1. Belum login -> ke halaman login (simpan tujuan awal)
  if (!session || !role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Role tidak sesuai -> kembalikan ke dashboard role-nya sendiri
  if (!allowedRoles.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }

  // 3. Lolos -> render route di dalamnya
  return <Outlet />;
};

export default ProtectedRoute;