import type { Role } from './types'

export interface DashboardAction {
  icon: string
  title: string
  description: string
  href: string
  reactRoute?: boolean
}

export interface DashboardConfig {
  label: string
  description: string
  actions: DashboardAction[]
}

export const DASHBOARD_CONFIG: Record<Role, DashboardConfig> = {
  ADMIN: {
    label: 'Administrador',
    description: 'Administra usuarios, perfiles y la configuración general de MediReservas.',
    actions: [
      { icon: 'US', title: 'Gestionar usuarios', description: 'Crea, edita y cambia el estado de las cuentas.', href: '/usuarios', reactRoute: true },
      { icon: 'RO', title: 'Roles y permisos', description: 'Asigna perfiles y revisa los accesos disponibles.', href: '/roles', reactRoute: true },
      { icon: 'ME', title: 'Gestionar médicos', description: 'Mantén actualizada la información de los profesionales.', href: '/admin-medicos', reactRoute: true },
      { icon: 'ES', title: 'Especialidades', description: 'Administra las áreas de atención médica disponibles.', href: '/admin-especialidades', reactRoute: true },
    ],
  },
  RECEPTIONIST: {
    label: 'Recepcionista',
    description: 'Revisa y gestiona las solicitudes de atención de los pacientes.',
    actions: [
      { icon: 'CI', title: 'Gestionar citas', description: 'Consulta, confirma, reagenda o cancela las solicitudes de atención.', href: '/gestion-citas', reactRoute: true },
    ],
  },
  DOCTOR: {
    label: 'Médico',
    description: 'Consulta tu agenda y registra la información de tus atenciones.',
    actions: [
      { icon: 'AG', title: 'Mi agenda', description: 'Revisa tus citas y registra observaciones de las atenciones confirmadas.', href: '/agenda-medica', reactRoute: true },
      { icon: 'HI', title: 'Historial clínico', description: 'Consulta antecedentes asociados a tus atenciones.', href: '/historial-clinico', reactRoute: true },
    ],
  },
  PATIENT: {
    label: 'Paciente',
    description: 'Reserva horas y consulta el estado de tus próximas atenciones médicas.',
    actions: [
      { icon: 'RE', title: 'Reservar una hora', description: 'Selecciona especialidad, profesional, fecha y horario.', href: '/solicitar-cita', reactRoute: true },
      { icon: 'MC', title: 'Mis citas', description: 'Consulta, revisa o cancela tus próximas atenciones.', href: '/mis-citas', reactRoute: true },
      { icon: 'ME', title: 'Buscar médicos', description: 'Encuentra profesionales por nombre o especialidad.', href: '/legacy/pages/medicos-especialidades.html' },
      { icon: 'HI', title: 'Historial clínico', description: 'Revisa las observaciones de tus atenciones anteriores.', href: '/historial-clinico', reactRoute: true },
    ],
  },
}

export function isValidRole(role: string): role is Role {
  return Object.hasOwn(DASHBOARD_CONFIG, role)
}

export function validateRoleChange(currentRole: Role, newRole: string) {
  if (!isValidRole(newRole)) return 'Selecciona un rol válido.'
  if (currentRole === newRole) return 'Selecciona un rol diferente al actual.'
  return ''
}
