import { Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from '../pages/bendahara/Dashboard'
import Keuangan from '../pages/bendahara/Keuangan'
import Laporan from '../pages/bendahara/Laporan'

const BendaharaRoute = () => {
  return (
    <Routes>
        <Route index element={<Navigate to='dashboard'/>}/>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='keuangan' element={<Keuangan/>}/>
        <Route path='laporan' element={<Laporan/>}/>
    </Routes>
  )
}

export default BendaharaRoute