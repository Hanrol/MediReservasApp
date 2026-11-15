import type { Doctor } from '../types/doctor'
import type { Role } from '../types/role'
import type { Specialty } from '../types/specialty'
import type { User } from '../types/user'
import { apiRequest } from './api-client'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

interface ApiUser {
  userId: number
  authUserId: number
  run: string
  email: string
  active: boolean
}

interface AuthUser {
  authUserId: number
  email: string
  enabled: boolean
  roles: string[]
}

interface UserProfile {
  userProfileId: number
  userId: number
  firstName: string
  lastName: string
  phone?: string | null
  birthDate?: string | null
  address?: string | null
}

interface ApiDoctor {
  doctorId: number
  userId: number
  medicalLicenseNumber: string
  active: boolean
  specialtyIds: number[]
}

function data<T>(response: ApiResponse<T>): T {
  return response.data
}

export async function getAdminUsers(token: string): Promise<User[]> {
  const [usersResponse, authResponse, profilesResponse] = await Promise.all([
    apiRequest<ApiResponse<ApiUser[]>>('/users', { token }),
    apiRequest<ApiResponse<AuthUser[]>>('/auth/users', { token }),
    apiRequest<ApiResponse<UserProfile[]>>('/user-profiles', { token }),
  ])
  const authUsers = new Map(data(authResponse).map((authUser) => [authUser.authUserId, authUser]))
  const profiles = new Map(data(profilesResponse).map((profile) => [profile.userId, profile]))

  return data(usersResponse).flatMap((user) => {
    const authUser = authUsers.get(user.authUserId)
    const profile = profiles.get(user.userId)
    const role = authUser?.roles.find((candidate): candidate is Role =>
      ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT'].includes(candidate),
    )
    if (!role) return []
    return [{
      userId: user.userId,
      authUserId: user.authUserId,
      run: user.run,
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      email: user.email,
      password: '',
      role,
      roles: authUser?.roles.filter((candidate): candidate is Role =>
        ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT'].includes(candidate),
      ) ?? [role],
      active: user.active && Boolean(authUser?.enabled),
      serviceActive: user.active,
      authEnabled: authUser?.enabled,
      phone: profile?.phone ?? undefined,
      birthDate: profile?.birthDate ?? undefined,
      address: profile?.address ?? undefined,
      userProfileId: profile?.userProfileId,
    } satisfies User]
  })
}

export async function getAdminDoctors(token: string): Promise<Doctor[]> {
  const [doctors, users] = await Promise.all([
    apiRequest<ApiDoctor[]>('/doctors', { token }),
    getAdminUsers(token),
  ])
  const usersById = new Map(users.map((user) => [user.userId, user]))
  return doctors.map((doctor) => {
    const user = usersById.get(doctor.userId)
    return {
      doctorId: doctor.doctorId,
      userId: doctor.userId,
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      run: user?.run ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      medicalLicenseNumber: doctor.medicalLicenseNumber,
      specialtyIds: doctor.specialtyIds ?? [],
      admissionDate: '',
      active: doctor.active,
    }
  })
}

export async function getAdminSpecialties(token: string): Promise<Specialty[]> {
  return data(await apiRequest<ApiResponse<Specialty[]>>('/specialties', { token }))
}

export async function saveAdminUser(token: string, user: User): Promise<void> {
  await apiRequest<ApiResponse<ApiUser>>(`/users/${user.userId}`, {
    method: 'PUT',
    token,
    body: { run: user.run, email: user.email },
  })
  if (user.userProfileId) {
    await apiRequest<ApiResponse<UserProfile>>(`/user-profiles/${user.userProfileId}`, {
      method: 'PUT',
      token,
      body: {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || null,
        birthDate: user.birthDate || null,
        address: user.address || null,
      },
    })
  }
}

export async function setAdminUserStatus(token: string, user: User, active: boolean): Promise<void> {
  const userAction = active ? 'activate' : 'deactivate'
  const authAction = active ? 'enable' : 'disable'
  const requests: Promise<unknown>[] = []
  if (user.serviceActive !== active) {
    requests.push(apiRequest<ApiResponse<ApiUser>>(`/users/${user.userId}/${userAction}`, { method: 'PATCH', token }))
  }
  if (user.authEnabled !== active) {
    requests.push(apiRequest<ApiResponse<AuthUser>>(`/auth/users/${user.authUserId}/${authAction}`, { method: 'PATCH', token }))
  }
  await Promise.all(requests)
}

export async function saveAdminDoctor(token: string, doctor: Doctor, isNew: boolean): Promise<void> {
  const payload = {
    userId: doctor.userId,
    medicalLicenseNumber: doctor.medicalLicenseNumber,
    active: doctor.active,
    specialtyIds: doctor.specialtyIds,
  }
  if (isNew) {
    await apiRequest<ApiDoctor>('/doctors', { method: 'POST', token, body: payload })
  } else {
    await apiRequest<ApiDoctor>(`/doctors/${doctor.doctorId}`, { method: 'PUT', token, body: payload })
  }
}

export async function saveAdminSpecialty(
  token: string,
  specialty: Specialty,
  isNew: boolean,
  previousActive?: boolean,
): Promise<void> {
  const payload = { specialtyName: specialty.specialtyName, description: specialty.description }
  if (isNew) {
    const response = await apiRequest<ApiResponse<Specialty>>('/specialties', { method: 'POST', token, body: payload })
    if (!specialty.active) {
      await apiRequest<ApiResponse<Specialty>>(`/specialties/${response.data.specialtyId}/deactivate`, {
        method: 'PATCH', token,
      })
    }
    return
  }
  await apiRequest<ApiResponse<Specialty>>(`/specialties/${specialty.specialtyId}`, {
    method: 'PUT', token, body: payload,
  })
  if (previousActive !== undefined && previousActive !== specialty.active) {
    const statusPath = specialty.active ? 'activate' : 'deactivate'
    await apiRequest<ApiResponse<Specialty>>(`/specialties/${specialty.specialtyId}/${statusPath}`, {
      method: 'PATCH', token,
    })
  }
}

export async function getAdminDashboardSummary(token: string): Promise<Array<{ value: number; label: string }>> {
  const [users, specialties] = await Promise.all([getAdminUsers(token), getAdminSpecialties(token)])
  return [
    { value: new Set(users.map((user) => user.role)).size, label: 'Perfiles del sistema' },
    { value: users.filter((user) => user.active).length, label: 'Usuarios activos' },
    { value: specialties.filter((specialty) => specialty.active).length, label: 'Especialidades activas' },
  ]
}
