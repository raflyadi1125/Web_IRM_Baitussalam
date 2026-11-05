import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from '../pages/admin/Dashboard'
import DataAnggota from '../pages/admin/DataAnggota'
import DataPengurus from '../pages/admin/DataPengurus'
import Kegiatan from '../pages/admin/Kegiatan'
import Keuangan from '../pages/admin/Keuangan'
import Laporan from '../pages/admin/Laporan'
import Pengumuman from '../pages/admin/Pengumuman'

const AdminRoute = () => {
  return (
    <Routes>
        <Route index element={<Navigate to='dashboard'/>}/>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='data-anggota' element={<DataAnggota/>}/>
        <Route path='data-pengurus' element={<DataPengurus/>}/>
        <Route path='kegiatan' element={<Kegiatan/>}/>
        <Route path='keuangan' element={<Keuangan/>}/>
        <Route path='laporan' element={<Laporan/>}/>
        <Route path='pengumuman' element={<Pengumuman/>}/>
    </Routes>
  )
}

export default AdminRoute