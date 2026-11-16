import { apiRequest } from './api-client'
import type { Doctor } from '../types/doctor'
import type { Schedule } from '../types/schedule'
import type { Specialty } from '../types/specialty'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface ApiPublicSpecialty {
  specialtyId: number
  specialtyName: string
  description: string | null
}

interface ApiPublicDoctor {
  doctorId: number
  firstName: string
  lastName: string
  medicalLicenseNumber: string
  specialties: ApiPublicSpecialty[]
}

interface ApiPublicScheduleSlot {
  scheduleSlotId: number
  doctorId: number
  slotDate: string
  startTime: string
  endTime: string
}

export interface PublicDoctorDirectory {
  doctors: Doctor[]
  specialties: Specialty[]
}

export async function getPublicDoctorDirectory(): Promise<PublicDoctorDirectory> {
  const response = await apiRequest<ApiResponse<ApiPublicDoctor[]>>('/doctors/directory')
  const specialtiesById = new Map<number, Specialty>()
  const doctors = response.data.map((doctor): Doctor => {
    for (const specialty of doctor.specialties) {
      specialtiesById.set(specialty.specialtyId, {
        specialtyId: specialty.specialtyId,
        specialtyName: specialty.specialtyName,
        description: specialty.description ?? '',
        active: true,
      })
    }

    return {
      doctorId: doctor.doctorId,
      userId: 0,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      run: '',
      email: '',
      phone: '',
      medicalLicenseNumber: doctor.medicalLicenseNumber,
      specialtyIds: doctor.specialties.map((specialty) => specialty.specialtyId),
      admissionDate: '',
      active: true,
    }
  })

  return { doctors, specialties: [...specialtiesById.values()] }
}

export async function getPublicDoctorSchedules(doctorId: number): Promise<Schedule[]> {
  const response = await apiRequest<ApiResponse<ApiPublicScheduleSlot[]>>(
    `/schedule-slots/public?doctorId=${encodeURIComponent(doctorId)}`,
  )
  return response.data.map((slot) => ({
    id: slot.scheduleSlotId,
    doctorId: slot.doctorId,
    date: slot.slotDate,
    time: slot.startTime.slice(0, 5),
    available: true,
  }))
}
