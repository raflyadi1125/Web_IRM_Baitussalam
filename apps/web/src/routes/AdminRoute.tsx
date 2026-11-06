import type { ReactElement } from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/admin/Dashboard";
import Kegiatan from "../pages/admin/Kegiatan";
import Keuangan from "../pages/admin/Keuangan";
import DataAnggota from "../pages/admin/DataAnggota";
import DataPengurus from "../pages/admin/DataPengurus";
import Laporan from "../pages/admin/Laporan";
import Pengumuman from "../pages/admin/Pengumuman";

const AdminRoute = (): ReactElement => {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="kegiatan" element={<Kegiatan />} />
      <Route path="keuangan" element={<Keuangan />} />
      <Route path="anggota" element={<DataAnggota />} />
      <Route path="pengurus" element={<DataPengurus />} />
      <Route path="laporan" element={<Laporan />} />
      <Route path="pengumuman" element={<Pengumuman />} />
      <Route path="*" element={<h1>404 - Halaman admin tidak ditemukan</h1>} />
    </Routes>
  );
};

export default AdminRoute;