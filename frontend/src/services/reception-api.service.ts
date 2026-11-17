import { apiRequest } from './api-client'
import type { Appointment, AppointmentStatus } from '../types/appointment'
import type { Schedule } from '../types/schedule'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface ApiAppointment {
  appointmentId: number
  patientUserId: number
  doctorId: number
  specialtyId: number
  scheduleSlotId: number
  slotDate: string
  startTime: string
  endTime: string
  appointmentStatus: AppointmentStatus
  reason: string | null
  patientName: string | null
  patientRun: string | null
}

interface ApiScheduleSlot {
  scheduleSlotId: number
  doctorId: number
  slotDate: string
  startTime: string
  endTime: string
}

interface ApiDoctor {
  doctorId: number
  firstName: string
  lastName: string
  specialties: Array<{ specialtyId: number; specialtyName: string }>
}

interface ApiSpecialty {
  specialtyId: number
  specialtyName: string
}

export interface ReceptionData {
  appointments: Appointment[]
  schedules: Schedule[]
  patientRunById: Map<number, string>
}

export async function getReceptionData(token: string): Promise<ReceptionData> {
  const [appointmentResponse, doctors, specialtyResponse] = await Promise.all([
    apiRequest<ApiResponse<ApiAppointment[]>>('/appointments', { token }),
    apiRequest<ApiResponse<ApiDoctor[]>>('/doctors/directory', { token }),
    apiRequest<ApiResponse<ApiSpecialty[]>>('/specialties/public/active', { token }),
  ])

  const slotsByDoctor = await Promise.all(doctors.data.map((doctor) =>
    apiRequest<ApiResponse<ApiScheduleSlot[]>>(
      `/schedule-slots/public?doctorId=${doctor.doctorId}`,
      { token },
    )))
  const slots = slotsByDoctor.flatMap((response) => response.data)
  const doctorNames = new Map(doctors.data.map((doctor) =>
    [doctor.doctorId, `${doctor.firstName} ${doctor.lastName}`.trim()]))
  const specialtyNames = new Map(specialtyResponse.data.map((specialty) => [
    specialty.specialtyId,
    specialty.specialtyName,
  ]))

  const appointments = appointmentResponse.data.map((appointment): Appointment => {
    return {
      appointmentId: appointment.appointmentId,
      patientUserId: appointment.patientUserId,
      patientName: appointment.patientName ?? `Paciente #${appointment.patientUserId}`,
      doctorId: appointment.doctorId,
      doctorName: doctorNames.get(appointment.doctorId) ?? `Médico #${appointment.doctorId}`,
      specialtyId: appointment.specialtyId,
      specialtyName: specialtyNames.get(appointment.specialtyId) ?? `Especialidad #${appointment.specialtyId}`,
      scheduleSlotId: appointment.scheduleSlotId,
      date: appointment.slotDate || '',
      time: appointment.startTime?.slice(0, 5) ?? '',
      reason: appointment.reason ?? '',
      appointmentStatus: appointment.appointmentStatus,
    }
  })

  const schedules = slots.map((slot): Schedule => ({
    id: slot.scheduleSlotId,
    doctorId: slot.doctorId,
    date: slot.slotDate,
    time: slot.startTime.slice(0, 5),
    available: true,
  }))

  return {
    appointments,
    schedules,
    patientRunById: new Map(appointmentResponse.data
      .filter((appointment) => appointment.patientRun)
      .map((appointment) => [appointment.patientUserId, appointment.patientRun!])),
  }
}

export async function confirmReceptionAppointment(
  token: string,
  appointmentId: number,
  userId: number,
): Promise<void> {
  await apiRequest(`/appointments/${appointmentId}/confirm`, {
    method: 'PATCH',
    token,
    body: { changedByUserId: userId, changeReason: 'Confirmada por recepción' },
  })
}

export async function cancelReceptionAppointment(
  token: string,
  appointmentId: number,
  userId: number,
): Promise<void> {
  await apiRequest(`/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    token,
    body: { cancelledByUserId: userId, cancellationReason: 'Cancelada por recepción' },
  })
}

export async function rescheduleReceptionAppointment(
  token: string,
  appointment: Appointment,
  scheduleSlotId: number,
  userId: number,
): Promise<void> {
  await apiRequest(`/appointments/${appointment.appointmentId}`, {
    method: 'PUT',
    token,
    body: {
      doctorId: appointment.doctorId,
      specialtyId: appointment.specialtyId,
      scheduleSlotId,
      reason: appointment.reason,
      changedByUserId: userId,
      changeReason: 'Reagendada por recepción',
    },
  })
}
