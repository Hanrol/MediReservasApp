import type { User } from '../types/user.ts'

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'MR'
}

function formatProfileDate(dateValue?: string) {
  if (!dateValue) return 'Sin información'
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dateValue}T00:00:00Z`))
}

export function createProfileData(user: User, roleLabel: string) {
  const fullName = `${user.firstName} ${user.lastName}`.trim()
  return {
    initials: getInitials(user.firstName, user.lastName),
    fullName: fullName || 'Usuario MediReservas',
    role: roleLabel || 'Usuario',
    run: user.run || 'Sin información',
    email: user.email || 'Sin información',
    phone: user.phone || 'Sin información',
    birthDate: formatProfileDate(user.birthDate),
    address: user.address || 'Sin información',
    status: user.active ? 'Activa' : 'Inactiva',
  }
}
