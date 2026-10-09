import { Navigate, Route, Routes } from 'react-router-dom'
import AuthGuard from './guards/AuthGuard'
import RoleGuard from './guards/RoleGuard'
import AccesoDenegado from './pages/AccesoDenegado'
import Contacto from './pages/Contacto'
import SolicitarCita from './pages/paciente/Solicitar-cita';
import ObservacionClinica from './pages/medico/Observacion-clinica';
import MisCitas from './pages/paciente/Mis-citas';
import AgendaMedica from './pages/medico/Agenda-Medica';
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import Registro from './pages/Registro'
import Roles from './pages/Roles'
import Usuarios from './pages/Usuarios'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/acceso-denegado" element={<AccesoDenegado />} />

      <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
      <Route path="/perfil" element={<AuthGuard><Perfil /></AuthGuard>} />

      <Route path="/usuarios" element={<RoleGuard allowedRoles={['ADMIN']}><Usuarios /></RoleGuard>} />
      <Route path="/roles" element={<RoleGuard allowedRoles={['ADMIN']}><Roles /></RoleGuard>} />

      <Route path="/agenda-medica" element={<RoleGuard allowedRoles={['DOCTOR']}><AgendaMedica /></RoleGuard>} />
      <Route path="/observacion-clinica" element={<RoleGuard allowedRoles={['DOCTOR']}><ObservacionClinica /></RoleGuard>} />

      <Route path="/solicitar-cita" element={<RoleGuard allowedRoles={['PATIENT']}><SolicitarCita /></RoleGuard>} />
      <Route path="/mis-citas" element={<RoleGuard allowedRoles={['PATIENT']}><MisCitas /></RoleGuard>} />

      <Route path="/agenda-medica" element={<RoleGuard allowedRoles={['DOCTOR']}><AgendaMedica /></RoleGuard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
