import type { Role } from '../types/role'
import { apiRequest } from './api-client'

export interface AdminInvitation {
  invitationId: number
  email: string
  role: Role
  expiresAt: string
  status: 'PENDING' | 'EXPIRED'
}

interface CreatedInvitation extends Omit<AdminInvitation, 'status'> {
  token: string
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export async function createAdminInvitation(
  email: string,
  role: Role,
  token: string,
): Promise<CreatedInvitation> {
  const response = await apiRequest<ApiResponse<CreatedInvitation>>('/admin/invitations', {
    method: 'POST',
    token,
    body: { email: email.trim().toLowerCase(), role },
  })

  return response.data
}

export async function getAdminInvitations(token: string): Promise<AdminInvitation[]> {
  const response = await apiRequest<ApiResponse<AdminInvitation[]>>('/admin/invitations', { token })
  return response.data
}

export interface AcceptInvitationRequest {
  token: string
  run: string
  firstName: string
  lastName: string
  phone: string
  birthDate: string | null
  address: string
  password: string
}

export async function acceptAdminInvitation(request: AcceptInvitationRequest): Promise<void> {
  await apiRequest<ApiResponse<{ userId: number; email: string; role: Role }>>('/invitations/accept', {
    method: 'POST',
    body: request,
  })
}
