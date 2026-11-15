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
  appointmentStatus: AppointmentStatus
  reason: string | null
}

interface ApiScheduleSlot {
  scheduleSlotId: number
  doctorId: number
  slotDate: string
  startTime: string
  endTime: string
  slotStatus: string
  appointmentId: number | null
}

interface ApiUser {
  userId: number
  run: string
}

interface ApiUserProfile {
  userId: number
  firstName: string
  lastName: string
}

interface ApiDoctor {
  doctorId: number
  userId: number
  specialtyIds: number[]
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
  const [appointmentResponse, slotResponse, userResponse, profileResponse, doctors, specialtyResponse] = await Promise.all([
    apiRequest<ApiResponse<ApiAppointment[]>>('/appointments', { token }),
    apiRequest<ApiResponse<ApiScheduleSlot[]>>('/schedule-slots', { token }),
    apiRequest<ApiResponse<ApiUser[]>>('/users', { token }),
    apiRequest<ApiResponse<ApiUserProfile[]>>('/user-profiles', { token }),
    apiRequest<ApiDoctor[]>('/doctors', { token }),
    apiRequest<ApiResponse<ApiSpecialty[]>>('/specialties', { token }),
  ])

  const slots = slotResponse.data
  const slotsById = new Map(slots.map((slot) => [slot.scheduleSlotId, slot]))
  const profilesByUserId = new Map(profileResponse.data.map((profile) => [profile.userId, profile]))
  const doctorNames = new Map(doctors.map((doctor) => {
    const profile = profilesByUserId.get(doctor.userId)
    return [doctor.doctorId, profile ? `${profile.firstName} ${profile.lastName}`.trim() : `Médico #${doctor.doctorId}`]
  }))
  const specialtyNames = new Map(specialtyResponse.data.map((specialty) => [
    specialty.specialtyId,
    specialty.specialtyName,
  ]))

  const appointments = appointmentResponse.data.map((appointment): Appointment => {
    const slot = slotsById.get(appointment.scheduleSlotId)
    const patient = profilesByUserId.get(appointment.patientUserId)
    return {
      appointmentId: appointment.appointmentId,
      patientUserId: appointment.patientUserId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}`.trim() : `Paciente #${appointment.patientUserId}`,
      doctorId: appointment.doctorId,
      doctorName: doctorNames.get(appointment.doctorId) ?? `Médico #${appointment.doctorId}`,
      specialtyId: appointment.specialtyId,
      specialtyName: specialtyNames.get(appointment.specialtyId) ?? `Especialidad #${appointment.specialtyId}`,
      scheduleSlotId: appointment.scheduleSlotId,
      date: slot?.slotDate ?? '',
      time: slot?.startTime?.slice(0, 5) ?? '',
      reason: appointment.reason ?? '',
      appointmentStatus: appointment.appointmentStatus,
    }
  })

  const schedules = slots.map((slot): Schedule => ({
    id: slot.scheduleSlotId,
    doctorId: slot.doctorId,
    date: slot.slotDate,
    time: slot.startTime.slice(0, 5),
    available: (slot.slotStatus === 'DISPONIBLE' || slot.slotStatus === 'LIBERADO_POR_CANCELACION')
      && slot.appointmentId == null,
  }))

  return {
    appointments,
    schedules,
    patientRunById: new Map(userResponse.data.map((user) => [user.userId, user.run])),
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
