import { appointmentsStorage } from '../storage/appointments.storage'
import type { User } from '../types/user'
import { getDoctorForUser } from './doctors.service'
import { getSpecialties } from './specialties.service'
import { getUsers } from './users.service'

interface DashboardSummaryItem {
  value: number
  label: string
}

export function getDashboardSummary(user: User): DashboardSummaryItem[] {
  const appointments = appointmentsStorage.getAll()
  const today = new Date().toISOString().slice(0, 10)

  if (user.role === 'ADMIN') return [
    { value: new Set(getUsers().map((item) => item.role)).size, label: 'Perfiles del sistema' },
    { value: getUsers().filter((item) => item.active).length, label: 'Usuarios activos' },
    { value: getSpecialties().filter((item) => item.active).length, label: 'Especialidades activas' },
  ]

  if (user.role === 'RECEPTIONIST') return [
    { value: appointments.filter((item) => item.appointmentStatus === 'PENDING').length, label: 'Citas pendientes' },
    { value: appointments.filter((item) => item.appointmentStatus === 'CONFIRMED').length, label: 'Citas confirmadas' },
    { value: appointments.filter((item) => item.appointmentStatus === 'CANCELLED').length, label: 'Citas canceladas' },
  ]

  if (user.role === 'DOCTOR') {
    const doctor = getDoctorForUser(user)
    const ownAppointments = appointments.filter((item) => item.doctorId === doctor?.doctorId)
    return [
      { value: ownAppointments.filter((item) => item.date === today && item.appointmentStatus !== 'CANCELLED').length, label: 'Atenciones de hoy' },
      { value: ownAppointments.filter((item) => item.appointmentStatus === 'CONFIRMED' && item.date <= today).length, label: 'Observaciones pendientes' },
      { value: ownAppointments.filter((item) => item.appointmentStatus === 'COMPLETED').length, label: 'Atenciones completadas' },
    ]
  }

  const ownAppointments = appointments.filter((item) => item.patientUserId === user.userId)
  return [
    { value: ownAppointments.filter((item) => item.date >= today && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(item.appointmentStatus)).length, label: 'Próximas citas' },
    { value: ownAppointments.filter((item) => item.appointmentStatus === 'PENDING').length, label: 'Solicitudes pendientes' },
    { value: ownAppointments.filter((item) => item.appointmentStatus === 'COMPLETED').length, label: 'Atenciones realizadas' },
  ]
}
