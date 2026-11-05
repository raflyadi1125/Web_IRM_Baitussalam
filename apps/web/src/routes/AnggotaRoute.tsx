import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from '../pages/anggota/Dashboard'
import Kegiatan from '../pages/anggota/Kegiatan'
import Pengumuman from '../pages/anggota/Pengumuman'

const AnggotaRoute = () => {
  return (
    <Routes>
        <Route index element={<Navigate to='dashboard'/>}/>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='kegiatan' element={<Kegiatan/>}/>
        <Route path='pengumuman' element={<Pengumuman/>}/>
    </Routes>  )
}

export default AnggotaRoute