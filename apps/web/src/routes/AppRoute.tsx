import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

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

const AppRoute = (): ReactElement => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin: layout sebagai wrapper, halaman dirender di Outlet-nya */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="*" element={<AdminRoute />} />
        </Route>

        {/* Sekretaris */}
        <Route path="/sekretaris" element={<SekretarisLayout />}>
          <Route path="*" element={<SekretarisRoute />} />
        </Route>

        {/* Bendahara */}
        <Route path="/bendahara" element={<BendaharaLayout />}>
          <Route path="*" element={<BendaharaRoute />} />
        </Route>

        {/* Anggota */}
        <Route path="/anggota" element={<AnggotaLayout />}>
          <Route path="*" element={<AnggotaRoute />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<h1>404 - Halaman Tidak Ditemukan</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoute;