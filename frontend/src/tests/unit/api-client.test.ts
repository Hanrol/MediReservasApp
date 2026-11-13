import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError, API_BASE_URL, apiRequest } from '../../services/api-client'

describe('cliente HTTP de la API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('usa el prefijo v3 y serializa solicitudes JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ code: 200, data: { token: 'jwt' } }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiRequest<{ code: number; data: { token: string } }>('auth/login', {
      method: 'POST',
      body: { email: 'persona@example.test', password: 'secreto' },
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${API_BASE_URL}/auth/login`)
    expect(init.method).toBe('POST')
    expect(init.headers).toBeInstanceOf(Headers)
    expect((init.headers as Headers).get('Content-Type')).toBe('application/json')
    expect(init.body).toBe(JSON.stringify({ email: 'persona@example.test', password: 'secreto' }))
    expect(result.data.token).toBe('jwt')
  })

  it('agrega el JWT como Bearer sin modificar los headers existentes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await apiRequest('/doctors', {
      headers: { 'X-Request-Source': 'frontend' },
      token: 'jwt-de-prueba',
    })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = init.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer jwt-de-prueba')
    expect(headers.get('X-Request-Source')).toBe('frontend')
    expect(headers.get('Accept')).toBe('application/json')
  })

  it('expone estado y mensaje de errores HTTP en ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(
      { code: 401, message: 'Token inválido', data: null },
      401,
    )))

    await expect(apiRequest('/doctors')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Token inválido',
      status: 401,
      code: 401,
    } satisfies Partial<ApiError>)
  })

  it('acepta respuestas sin contenido', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(apiRequest<void>('/resource/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })
})

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
