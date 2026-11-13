import { afterEach, describe, expect, it, vi } from 'vitest'

import { registerPatient } from '../../services/registration.service'

describe('Registro de pacientes API', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('envía los datos al endpoint público de registro de pacientes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 201,
      message: 'Cuenta creada correctamente',
      data: { userId: 12, email: 'ana@example.test', firstName: 'Ana', lastName: 'Pérez' },
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await registerPatient({
      run: '12345678-5',
      firstName: 'Ana',
      lastName: 'Pérez',
      birthDate: null,
      phone: '',
      address: '',
      email: 'ana@example.test',
      password: 'clave-segura',
      termsAccepted: true,
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/v3/patient-registrations')
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
      body: expect.stringContaining('"termsAccepted":true'),
    })
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).headers).toBeInstanceOf(Headers)
    expect(((fetchMock.mock.calls[0]?.[1] as RequestInit).headers as Headers).has('Authorization')).toBe(false)
    expect(result).toEqual({ userId: 12, email: 'ana@example.test', firstName: 'Ana', lastName: 'Pérez' })
  })
})
