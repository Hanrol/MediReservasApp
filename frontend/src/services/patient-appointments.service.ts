import { apiRequest } from './api-client'
import type { Appointment } from '../types/appointment'

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
  appointmentStatus: Appointment['appointmentStatus']
  reason: string | null
}

interface ApiSlot {
  scheduleSlotId: number
  slotDate: string
  startTime: string
}

interface PublicDoctor {
  doctorId: number
  firstName: string
  lastName: string
  specialties: { specialtyId: number; specialtyName: string }[]
}

export async function getPatientAppointments(token: string, patientUserId: number): Promise<Appointment[]> {
  const [appointments, slots, doctors] = await Promise.all([
    apiRequest<ApiResponse<ApiAppointment[]>>(`/appointments/patient/${patientUserId}`, { token }),
    apiRequest<ApiResponse<ApiSlot[]>>('/schedule-slots', { token }),
    apiRequest<ApiResponse<PublicDoctor[]>>('/doctors/directory'),
  ])
  const slotsById = new Map(slots.data.map((slot) => [slot.scheduleSlotId, slot]))
  const doctorsById = new Map(doctors.data.map((doctor) => [doctor.doctorId, doctor]))
  const specialtiesById = new Map(doctors.data.flatMap((doctor) =>
    doctor.specialties.map((specialty) => [specialty.specialtyId, specialty.specialtyName] as const)))
  return appointments.data.map((item) => {
    const slot = slotsById.get(item.scheduleSlotId)
    const doctor = doctorsById.get(item.doctorId)
    return {
      appointmentId: item.appointmentId,
      patientUserId: item.patientUserId,
      patientName: `Paciente #${item.patientUserId}`,
      doctorId: item.doctorId,
      doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : `Médico #${item.doctorId}`,
      specialtyId: item.specialtyId,
      specialtyName: specialtiesById.get(item.specialtyId) ?? `Especialidad #${item.specialtyId}`,
      scheduleSlotId: item.scheduleSlotId,
      date: slot?.slotDate ?? '',
      time: slot?.startTime.slice(0, 5) ?? '',
      reason: item.reason ?? '',
      appointmentStatus: item.appointmentStatus,
    }
  })
}

export async function cancelPatientAppointment(token: string, appointmentId: number, patientUserId: number) {
  await apiRequest(`/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    token,
    body: { cancelledByUserId: patientUserId, cancellationReason: 'Cancelada por el paciente' },
  })
}
