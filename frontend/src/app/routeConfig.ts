import type { ComponentType } from 'react'
import { ROUTES } from '../constants/routes'
import type { Role } from '../lib/types'
import AccesoDenegado from '../pages/shared/AccesoDenegado'
import Especialidades from '../pages/admin/Especialidades'
import Medicos from '../pages/admin/Medicos'
import Roles from '../pages/admin/Roles'
import Usuarios from '../pages/admin/Usuarios'
import Contacto from '../pages/public/Contacto'
import Dashboard from '../pages/shared/Dashboard'
import Home from '../pages/public/Home'
import Login from '../pages/public/Login'
import Agenda from '../pages/medico/Agenda'
import ObservacionClinica from '../pages/medico/ObservacionClinica'
import MisCitas from '../pages/paciente/MisCitas'
import SolicitarCita from '../pages/paciente/SolicitarCita'
import Perfil from '../pages/shared/Perfil'
import MedicosEspecialidades from '../pages/public/MedicosEspecialidades'
import GestionCitas from '../pages/recepcion/GestionCitas'
import Registro from '../pages/public/Registro'
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
  { path: ROUTES.adminDoctors, component: Medicos, allowedRoles: ['ADMIN'] },
  { path: ROUTES.adminSpecialties, component: Especialidades, allowedRoles: ['ADMIN'] },
  { path: ROUTES.appointmentManagement, component: GestionCitas, allowedRoles: ['ADMIN', 'RECEPTIONIST'] },
  { path: ROUTES.medicalSchedule, component: Agenda, allowedRoles: ['DOCTOR'] },
  { path: ROUTES.clinicalObservation, component: ObservacionClinica, allowedRoles: ['DOCTOR'] },
  { path: ROUTES.clinicalHistory, component: HistorialClinico, allowedRoles: ['DOCTOR', 'PATIENT'] },
  { path: ROUTES.requestAppointment, component: SolicitarCita, allowedRoles: ['PATIENT'] },
  { path: ROUTES.myAppointments, component: MisCitas, allowedRoles: ['PATIENT'] },
]
