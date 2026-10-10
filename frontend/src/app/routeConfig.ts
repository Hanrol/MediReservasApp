import type { ComponentType } from 'react'
import { ROUTES } from '../constants/routes'
import type { Role } from '../lib/types'
import AccesoDenegado from '../pages/AccesoDenegado'
import AdminEspecialidades from '../pages/admin/AdminEspecialidades'
import AdminMedicos from '../pages/admin/AdminMedicos'
import Roles from '../pages/admin/Roles'
import Usuarios from '../pages/admin/Usuarios'
import Contacto from '../pages/Contacto'
import Dashboard from '../pages/Dashboard'
import Home from '../pages/Home'
import Login from '../pages/Login'
import AgendaMedica from '../pages/medico/Agenda-Medica'
import ObservacionClinica from '../pages/medico/Observacion-clinica'
import MisCitas from '../pages/paciente/Mis-citas'
import SolicitarCita from '../pages/paciente/Solicitar-cita'
import Perfil from '../pages/Perfil'
import MedicosEspecialidades from '../pages/public/MedicosEspecialidades'
import GestionCitas from '../pages/recepcion/GestionCitas'
import Registro from '../pages/Registro'
import HistorialClinico from '../pages/shared/HistorialClinico'

export interface AppRoute {
  path: string
  component: ComponentType
  requiresAuth?: boolean
  allowedRoles?: readonly Role[]
}

export const routeConfig: readonly AppRoute[] = [
  { path: ROUTES.home, component: Home },
  { path: ROUTES.contact, component: Contacto },
  { path: ROUTES.login, component: Login },
  { path: ROUTES.register, component: Registro },
  { path: ROUTES.medicalDirectory, component: MedicosEspecialidades },
  { path: ROUTES.accessDenied, component: AccesoDenegado },
  { path: ROUTES.dashboard, component: Dashboard, requiresAuth: true },
  { path: ROUTES.profile, component: Perfil, requiresAuth: true },
  { path: ROUTES.users, component: Usuarios, allowedRoles: ['ADMIN'] },
  { path: ROUTES.roles, component: Roles, allowedRoles: ['ADMIN'] },
  { path: ROUTES.adminDoctors, component: AdminMedicos, allowedRoles: ['ADMIN'] },
  { path: ROUTES.adminSpecialties, component: AdminEspecialidades, allowedRoles: ['ADMIN'] },
  { path: ROUTES.appointmentManagement, component: GestionCitas, allowedRoles: ['ADMIN', 'RECEPTIONIST'] },
  { path: ROUTES.medicalSchedule, component: AgendaMedica, allowedRoles: ['DOCTOR'] },
  { path: ROUTES.clinicalObservation, component: ObservacionClinica, allowedRoles: ['DOCTOR'] },
  { path: ROUTES.clinicalHistory, component: HistorialClinico, allowedRoles: ['DOCTOR', 'PATIENT'] },
  { path: ROUTES.requestAppointment, component: SolicitarCita, allowedRoles: ['PATIENT'] },
  { path: ROUTES.myAppointments, component: MisCitas, allowedRoles: ['PATIENT'] },
]
