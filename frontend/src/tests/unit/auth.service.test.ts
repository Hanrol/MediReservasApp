import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockUsers } from '../../data/mockUsers'
import { authenticate, createSession } from '../../services/auth.service'
import { getSession } from '../../storage/session.storage'

describe('Autenticación y sesión', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('autentica en Auth y carga el perfil propio con el JWT', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({
        code: 200,
        data: { authUserId: 42, email: 'paciente@example.test', token: 'jwt-real', roles: ['PATIENT'] },
      }))
      .mockResolvedValueOnce(jsonResponse({
        code: 200,
        data: {
          userId: 8,
          authUserId: 42,
          run: '12345678-9',
          email: 'paciente@example.test',
          active: true,
          firstName: 'Ana',
          lastName: 'Pérez',
          phone: '912345678',
          birthDate: '1990-05-10',
          address: 'Santiago',
        },
      }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await authenticate(' PACIENTE@EXAMPLE.TEST ', 'clave-correcta')

    expect(result.token).toBe('jwt-real')
    expect(result.user).toMatchObject({
      userId: 8,
      authUserId: 42,
      role: 'PATIENT',
      firstName: 'Ana',
      lastName: 'Pérez',
      password: '',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/v3/auth/login')
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ email: 'paciente@example.test', password: 'clave-correcta' }),
    })
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/v3/users/me')
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit).headers).toBeInstanceOf(Headers)
    expect(((fetchMock.mock.calls[1]?.[1] as RequestInit).headers as Headers).get('Authorization'))
      .toBe('Bearer jwt-real')
  })

  it('rechaza cuentas sin un rol de aplicación y no consulta el perfil', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({
      code: 200,
      data: { authUserId: 42, email: 'sin-perfil@example.test', token: 'jwt-sin-rol', roles: [] },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(authenticate('sin-perfil@example.test', 'clave-correcta'))
      .rejects.toThrow('La cuenta no tiene un perfil activo')
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('crea y persiste una sesión con el JWT real sin incluir la contraseña', () => {
    const user = mockUsers[3]
    const session = createSession(user, 'jwt-real')

    expect(session.token).toBe('jwt-real')
    expect(session.authUserId).toBe(user.authUserId)
    expect(getSession()).toEqual(session)
    expect(JSON.stringify(session)).not.toContain(user.password)
  })
})

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
