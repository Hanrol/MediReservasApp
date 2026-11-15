import { apiRequest } from './api-client'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface ProfileCompletion {
  role: 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST'
  complete: boolean
  missingFields: string[]
}

export interface SpecialtyOption {
  specialtyId: number
  specialtyName: string
  active: boolean
}

export interface DoctorProfileData {
  doctorId: number
  userId: number
  medicalLicenseNumber: string
  active: boolean
  specialtyIds: number[]
}

export interface PatientProfileData {
  patientProfileId: number
  userId: number
  healthInsurance: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  bloodType: string | null
  allergies: string | null
  weight: number | null
}

export async function getProfileCompletion(token: string): Promise<ProfileCompletion> {
  const response = await apiRequest<ApiResponse<ProfileCompletion>>('/users/me/profile-completion', { token })
  return response.data
}

export async function updateMyProfile(
  token: string,
  values: { firstName: string; lastName: string; phone: string; birthDate: string | null; address: string },
) {
  const response = await apiRequest<ApiResponse<{
    userId: number
    authUserId: number
    run: string
    email: string
    active: boolean
    firstName: string
    lastName: string
    phone: string | null
    birthDate: string | null
    address: string | null
  }>>('/users/me/profile', { method: 'PUT', token, body: values })
  return response.data
}

export async function getDoctorProfileForCurrentUser(token: string): Promise<DoctorProfileData> {
  return apiRequest<DoctorProfileData>('/doctors/me', { token })
}

export async function createDoctorProfileForCurrentUser(
  token: string,
  values: { medicalLicenseNumber: string; specialtyIds: number[] },
): Promise<DoctorProfileData> {
  const response = await apiRequest<ApiResponse<DoctorProfileData>>('/doctors/me', {
    method: 'POST',
    token,
    body: values,
  })
  return response.data
}

export async function getActiveSpecialties(token: string): Promise<SpecialtyOption[]> {
  const response = await apiRequest<ApiResponse<SpecialtyOption[]>>('/specialties', { token })
  return response.data.filter((specialty) => specialty.active)
}

export async function getMyPatientProfile(token: string, userId: number): Promise<PatientProfileData> {
  const response = await apiRequest<ApiResponse<PatientProfileData>>(`/patient-profiles/user/${userId}`, { token })
  return response.data
}

export async function updateMyPatientProfile(
  token: string,
  values: Omit<PatientProfileData, 'patientProfileId' | 'userId'>,
): Promise<PatientProfileData> {
  const response = await apiRequest<ApiResponse<PatientProfileData>>('/patient-profiles/me', {
    method: 'PUT',
    token,
    body: values,
  })
  return response.data
}
