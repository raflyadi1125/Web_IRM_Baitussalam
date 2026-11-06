import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPassword from "../pages/auth/ForgotPassword";

import AdminLayout from "../layouts/AdminLayout";
import SekretarisLayout from "../layouts/SekretarisLayout";
import BendaharaLayout from "../layouts/BendaharaLayout";
import AnggotaLayout from "../layouts/AnggotaLayout";

import AdminRoute from "./AdminRoute";
import SekretarisRoute from "./SekretarisRoute";
import BendaharaRoute from "./BendaharaRoute";
import AnggotaRoute from "./AnggotaRoute";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoute = (): ReactElement => {
  return (
    <Routes>
      {/* Authentication (publik) */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="*" element={<AdminRoute />} />
        </Route>
      </Route>

      {/* Sekretaris */}
      <Route element={<ProtectedRoute allowedRoles={["sekretaris"]} />}>
        <Route path="/sekretaris" element={<SekretarisLayout />}>
          <Route path="*" element={<SekretarisRoute />} />
        </Route>
      </Route>

      {/* Bendahara */}
      <Route element={<ProtectedRoute allowedRoles={["bendahara"]} />}>
        <Route path="/bendahara" element={<BendaharaLayout />}>
          <Route path="*" element={<BendaharaRoute />} />
        </Route>
      </Route>

      {/* Anggota */}
      <Route element={<ProtectedRoute allowedRoles={["anggota"]} />}>
        <Route path="/anggota" element={<AnggotaLayout />}>
          <Route path="*" element={<AnggotaRoute />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<h1>404 - Halaman Tidak Ditemukan</h1>} />
    </Routes>
  );
};

export default AppRoute;