import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import { mockUsers } from '../../data/mockUsers'
import Dashboard from '../../pages/shared/Dashboard'
import Perfil from '../../pages/shared/Perfil'
import type { Session } from '../../types/auth'

function renderAsPatient(page: React.ReactNode, startSession = vi.fn()) {
  const patient = mockUsers.find((candidate) => candidate.role === 'PATIENT')!
  const session: Session = {
    token: 'onboarding-token',
    userId: patient.userId,
    authUserId: patient.authUserId,
    run: patient.run,
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    role: patient.role,
    active: patient.active,
  }
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{
        session,
        user: patient,
        isAuthenticated: true,
        startSession,
        logout: vi.fn(),
        refreshSession: vi.fn(),
      }}>
        {page}
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('Onboarding de perfil', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('muestra un recordatorio no bloqueante mientras faltan datos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 200,
      message: 'Estado del perfil obtenido correctamente',
      data: { role: 'PATIENT', complete: false, missingFields: ['phone'] },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })))

    renderAsPatient(<Dashboard />)

    expect(await screen.findByRole('heading', { name: 'Completa tu perfil' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Completar perfil' })).toHaveAttribute('href', '/perfil')
  })

  it('permite guardar el perfil sin datos opcionales y conserva completitud', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.endsWith('/users/me/profile-completion')) {
        return Promise.resolve(new Response(JSON.stringify({
          code: 200,
          message: 'Estado del perfil obtenido correctamente',
          data: { role: 'PATIENT', complete: true, missingFields: [] },
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      }
      if (url.endsWith('/patient-profiles/user/4')) {
        return Promise.resolve(new Response(JSON.stringify({
          code: 200,
          message: 'Perfil de paciente obtenido',
          data: {
            patientProfileId: 1,
            userId: 4,
            healthInsurance: null,
            emergencyContactName: null,
            emergencyContactPhone: null,
            bloodType: null,
            allergies: null,
            weight: null,
          },
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      }
      if (url.endsWith('/users/me/profile') && init?.method === 'PUT') {
        return Promise.resolve(new Response(JSON.stringify({
          code: 200,
          message: 'Perfil actualizado correctamente',
          data: {
            userId: 4,
            authUserId: 4,
            run: '44444444-4',
            email: 'paciente@medireservas.cl',
            active: true,
            firstName: 'Paula',
            lastName: 'Contreras',
            phone: null,
            birthDate: null,
            address: null,
          },
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      }
      throw new Error(`Unexpected request: ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)
    const startSession = vi.fn()
    renderAsPatient(<Perfil />, startSession)

    expect(screen.getAllByLabelText(/Teléfono/)[0]).not.toBeRequired()
    expect(screen.getByLabelText(/Fecha de nacimiento/)).not.toBeRequired()
    expect(screen.getByLabelText(/Dirección/)).not.toBeRequired()
    fireEvent.click(screen.getByRole('button', { name: 'Guardar datos personales' }))

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Tu perfil está completo.'))
    expect(fetchMock).toHaveBeenCalledWith('/api/v3/users/me/profile', expect.objectContaining({ method: 'PUT' }))
    const updateRequest = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/users/me/profile'))
    expect(JSON.parse(String(updateRequest?.[1]?.body))).toMatchObject({ phone: '', birthDate: null, address: '' })
    expect(startSession).toHaveBeenCalledWith(expect.objectContaining({ phone: undefined, birthDate: undefined, address: undefined }), 'onboarding-token')
  })
})
