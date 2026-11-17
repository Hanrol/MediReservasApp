import type { Appointment } from '../types/appointment'
import type { User } from '../types/user'
import { getDoctorAppointments } from './doctor-workflow.service'
import { getPatientAppointments } from './patient-appointments.service'
import { getReceptionData } from './reception-api.service'

export interface DashboardSummaryItem {
  value: number
  label: string
}

export async function getDashboardSummary(
  token: string,
  user: User,
): Promise<DashboardSummaryItem[]> {
  let appointments: Appointment[]
  if (user.role === 'RECEPTIONIST') {
    appointments = (await getReceptionData(token)).appointments
  } else if (user.role === 'DOCTOR') {
    const doctorName = `${user.firstName} ${user.lastName}`.trim()
    appointments = (await getDoctorAppointments(token, doctorName)).appointments
  } else if (user.role === 'PATIENT') {
    appointments = await getPatientAppointments(token, user.userId)
  } else {
    return []
  }

  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  if (user.role === 'RECEPTIONIST') return [
    { value: appointments.filter((item) => item.appointmentStatus === 'PENDING').length, label: 'Citas pendientes' },
    { value: appointments.filter((item) => item.appointmentStatus === 'CONFIRMED').length, label: 'Citas confirmadas' },
    { value: appointments.filter((item) => item.appointmentStatus === 'CANCELLED').length, label: 'Citas canceladas' },
  ]

  if (user.role === 'DOCTOR') {
    return [
      { value: appointments.filter((item) => item.date === today && item.appointmentStatus !== 'CANCELLED').length, label: 'Atenciones de hoy' },
      { value: appointments.filter((item) => item.appointmentStatus === 'CONFIRMED' && item.date <= today).length, label: 'Observaciones pendientes' },
      { value: appointments.filter((item) => item.appointmentStatus === 'COMPLETED').length, label: 'Atenciones completadas' },
    ]
  }

  return [
    { value: appointments.filter((item) => item.date >= today && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(item.appointmentStatus)).length, label: 'Próximas citas' },
    { value: appointments.filter((item) => item.appointmentStatus === 'PENDING').length, label: 'Solicitudes pendientes' },
    { value: appointments.filter((item) => item.appointmentStatus === 'COMPLETED').length, label: 'Atenciones realizadas' },
  ]
}
