import { apiRequest } from './api-client'

export interface PatientRegistrationRequest {
  run: string
  firstName: string
  lastName: string
  birthDate: string | null
  phone: string
  address: string
  email: string
  password: string
  termsAccepted: boolean
}

interface PatientRegistrationResponse {
  userId: number
  email: string
  firstName: string
  lastName: string
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export async function registerPatient(request: PatientRegistrationRequest): Promise<PatientRegistrationResponse> {
  const response = await apiRequest<ApiResponse<PatientRegistrationResponse>>('/patient-registrations', {
    method: 'POST',
    body: request,
  })

  return response.data
}
