import { apiRequest } from './api-client'

export type Weekday = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO'

export interface WeeklySchedule {
  doctorScheduleId: number
  doctorId: number
  dayOfWeek: Weekday
  startTime: string
  endTime: string
  active: boolean
}

export interface ConcreteSlot {
  scheduleSlotId: number
  doctorId: number
  slotDate: string
  startTime: string
  endTime: string
  slotStatus: string
  appointmentId: number | null
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface DoctorProfile {
  doctorId: number
}

export async function getDoctorScheduleContext(token: string) {
  const [doctor, schedulesResponse, slotsResponse] = await Promise.all([
    apiRequest<DoctorProfile>('/doctors/me', { token }),
    apiRequest<ApiResponse<WeeklySchedule[]>>('/doctor-schedules', { token }),
    apiRequest<ApiResponse<ConcreteSlot[]>>('/schedule-slots', { token }),
  ])
  return {
    doctorId: doctor.doctorId,
    schedules: schedulesResponse.data,
    slots: slotsResponse.data,
  }
}

export async function createConcreteSlot(
  token: string,
  input: { doctorId: number; slotDate: string; startTime: string },
) {
  const [hour, minute] = input.startTime.split(':').map(Number)
  const end = new Date(2000, 0, 1, hour, minute + 30)
  const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}:00`
  const response = await apiRequest<ApiResponse<ConcreteSlot>>('/schedule-slots', {
    method: 'POST',
    token,
    body: {
      doctorId: input.doctorId,
      slotDate: input.slotDate,
      startTime: `${input.startTime}:00`,
      endTime,
      slotStatus: 'DISPONIBLE',
      appointmentId: null,
    },
  })
  return response.data
}

export async function deleteConcreteSlot(token: string, id: number) {
  await apiRequest<ApiResponse<null>>(`/schedule-slots/${id}`, { method: 'DELETE', token })
}

export async function clearLegacyWeeklySchedules(token: string) {
  await apiRequest<ApiResponse<null>>('/doctor-schedules/me', { method: 'DELETE', token })
}
