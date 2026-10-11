import { ROUTES } from '../constants/routes'
import type { Role } from '../types/role'

const roleRestrictedRoutes: Record<string, readonly Role[]> = {
  [ROUTES.users]: ['ADMIN'],
  [ROUTES.roles]: ['ADMIN'],
  [ROUTES.adminDoctors]: ['ADMIN'],
  [ROUTES.adminSpecialties]: ['ADMIN'],
  [ROUTES.appointmentManagement]: ['ADMIN', 'RECEPTIONIST'],
  [ROUTES.medicalSchedule]: ['DOCTOR'],
  [ROUTES.clinicalObservation]: ['DOCTOR'],
  [ROUTES.clinicalHistory]: ['DOCTOR', 'PATIENT'],
  [ROUTES.requestAppointment]: ['PATIENT'],
  [ROUTES.myAppointments]: ['PATIENT'],
}

const authenticatedRoutes = new Set<string>([ROUTES.dashboard, ROUTES.profile])

export function getLoginRedirectPath(path: string, role?: Role): string {
  if (!role) return ROUTES.dashboard

  const allowedRoles = roleRestrictedRoutes[path]
  if (allowedRoles) return allowedRoles.includes(role) ? path : ROUTES.dashboard

  return authenticatedRoutes.has(path) ? path : ROUTES.dashboard
}
