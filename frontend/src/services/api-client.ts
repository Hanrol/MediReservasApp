const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const API_BASE_URL = (configuredApiUrl || '/api/v3').replace(/\/+$/, '')

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  token?: string
}

export class ApiError extends Error {
  public readonly status: number
  public readonly code?: number
  public readonly payload?: unknown

  constructor(
    message: string,
    status: number,
    code?: number,
    payload?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.payload = payload
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${API_BASE_URL}${normalizedPath}`
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  const { body, token, ...requestOptions } = options
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(url, {
    ...requestOptions,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = await readPayload(response)
  if (!response.ok) {
    const errorPayload = isRecord(payload) ? payload : undefined
    const message = typeof errorPayload?.message === 'string'
      ? errorPayload.message
      : `La solicitud a la API falló (HTTP ${response.status})`
    const code = typeof errorPayload?.code === 'number' ? errorPayload.code : undefined
    throw new ApiError(message, response.status, code, payload)
  }

  return payload as T
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) return undefined

  try {
    return await response.json()
  } catch {
    return undefined
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
