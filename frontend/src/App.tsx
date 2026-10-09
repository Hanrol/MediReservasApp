import { Navigate, Route, Routes } from 'react-router-dom'
import AuthGuard from './guards/AuthGuard'
import RoleGuard from './guards/RoleGuard'
import AccesoDenegado from './pages/AccesoDenegado'
import AdminEspecialidades from './pages/admin/AdminEspecialidades'
import AdminMedicos from './pages/admin/AdminMedicos'
import Roles from './pages/admin/Roles'
import Usuarios from './pages/admin/Usuarios'
import Contacto from './pages/Contacto'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import AgendaMedica from './pages/medico/Agenda-Medica'
import ObservacionClinica from './pages/medico/Observacion-clinica'
import MisCitas from './pages/paciente/Mis-citas'
import SolicitarCita from './pages/paciente/Solicitar-cita'
import Perfil from './pages/Perfil'
import GestionCitas from './pages/recepcion/GestionCitas'
import Registro from './pages/Registro'

function App() {
  return (
    <>
    <SolicitarCita></SolicitarCita>
    </>
  )
}

export default App
