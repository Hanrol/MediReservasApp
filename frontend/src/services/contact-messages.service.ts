import { apiRequest } from './api-client'

export interface ContactMessage {
  contactMessageId: number
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export async function sendContactMessage(input: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const response = await apiRequest<ApiResponse<ContactMessage>>('/contact-messages', {
    method: 'POST',
    body: input,
  })
  return response.data
}

export async function getContactMessages(token: string) {
  const response = await apiRequest<ApiResponse<ContactMessage[]>>('/contact-messages', { token })
  return response.data
}
