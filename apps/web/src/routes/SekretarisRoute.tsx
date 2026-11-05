import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from "../pages/sekretaris/Dashboard"
import Kegiatan from '../pages/sekretaris/Kegiatan'
import Pengumuman from '../pages/sekretaris/Pengumuman'
import Laporan from '../pages/sekretaris/Laporan'

const SekretarisRoute = () => {
  return (
    <Routes>
        <Route index element={<Navigate to='dashboard'/>}/>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='kegiatan' element={<Kegiatan/>}/>
        <Route path='pengumuman' element={<Pengumuman/>}/>
        <Route path='laporan' element={<Laporan/>}/>
    </Routes>
  )
}

export default SekretarisRoute