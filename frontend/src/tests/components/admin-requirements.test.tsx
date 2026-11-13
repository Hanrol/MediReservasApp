import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import { mockDoctors } from '../../data/mockDoctors'
import { mockSpecialties } from '../../data/mockSpecialties'
import { mockUsers } from '../../data/mockUsers'
import Especialidades from '../../pages/admin/Especialidades'
import Medicos from '../../pages/admin/Medicos'
import Roles from '../../pages/admin/Roles'
import Usuarios from '../../pages/admin/Usuarios'
import type { User } from '../../types/user'

const apiUsers = mockUsers.map(({ userId, authUserId, run, email, active }) => ({
  userId, authUserId, run, email, active,
}))
const authUsers = mockUsers.map(({ authUserId, email, active, role }) => ({
  authUserId, email, enabled: active, createdAt: '2024-01-01 10:00:00', roles: [role],
}))
let currentAuthUsers = authUsers
const profiles = mockUsers.map(({ userId, firstName, lastName, phone, address }) => ({
  userProfileId: userId + 100,
  userId,
  firstName,
  lastName,
  phone: phone ?? null,
  birthDate: null,
  address: address ?? null,
}))
const apiDoctors = mockDoctors.map(({ doctorId, userId, medicalLicenseNumber, active, specialtyIds }) => ({
  doctorId, userId, medicalLicenseNumber, active, specialtyIds,
}))

function response(data: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify({ code: status, message: 'ok', data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  }))
}

function defaultFetch(input: RequestInfo | URL, init?: RequestInit) {
  const url = String(input)
  if (url.endsWith('/users') && !url.includes('/auth/')) return response(apiUsers)
  if (url.endsWith('/auth/users')) return response(currentAuthUsers)
  if (url.endsWith('/user-profiles')) return response(profiles)
  if (url.endsWith('/doctors')) return Promise.resolve(new Response(JSON.stringify(apiDoctors), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }))
  if (url.endsWith('/specialties')) return response(mockSpecialties)
  if (url.endsWith('/admin/invitations')) return response([])
  if (url.includes('/admin/invitations') && init?.method === 'POST') {
    return response({ invitationId: 10, email: 'invite@example.cl', role: 'DOCTOR', token: 'invite-token', expiresAt: '2026-11-14T12:00:00' }, 201)
  }
  if (url.includes('/roles')) return response({ authUserId: 4, email: 'paciente@medireservas.cl', enabled: true, roles: ['PATIENT', 'RECEPTIONIST'] })
  return response(null)
}

function renderAsAdmin(page: React.ReactNode) {
  const admin = mockUsers.find((user) => user.role === 'ADMIN') as User
  const authValue = {
    session: {
      token: 'test-token', userId: admin.userId, authUserId: admin.authUserId, run: admin.run,
      firstName: admin.firstName, lastName: admin.lastName, email: admin.email, role: admin.role, active: admin.active,
    },
    user: admin,
    isAuthenticated: true,
    startSession: vi.fn(), logout: vi.fn(), refreshSession: vi.fn(),
  }

  return render(<MemoryRouter><AuthContext.Provider value={authValue}>{page}</AuthContext.Provider></MemoryRouter>)
}

describe('Administración con datos de API', () => {
  beforeEach(() => {
    localStorage.clear()
    currentAuthUsers = authUsers.map((user) => ({ ...user, roles: [...user.roles] }))
    vi.stubGlobal('fetch', vi.fn(defaultFetch))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('carga usuarios reales combinando perfiles y roles del backend', async () => {
    renderAsAdmin(<Usuarios />)
    expect(await screen.findByRole('row', { name: /Paula Contreras/ })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /Andrea Muñoz/ })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/v3/users', expect.objectContaining({ headers: expect.any(Headers) }))
    expect(localStorage.getItem('medireservas_users')).toBeNull()
  })

  it('muestra error de API sin mostrar usuarios locales como fallback', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))))
    renderAsAdmin(<Usuarios />)
    expect(await screen.findByText('No se pudieron cargar los usuarios desde el servidor.')).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /Paula Contreras/ })).not.toBeInTheDocument()
  })

  it('muestra roles existentes en modo de consulta y no permite cambiarlos', async () => {
    const fetchMock = vi.fn(defaultFetch)
    vi.stubGlobal('fetch', fetchMock)
    renderAsAdmin(<Roles />)

    const row = await screen.findByRole('row', { name: /Paula Contreras/ })
    expect(within(row).getByText('Paciente')).toBeInTheDocument()
    expect(screen.getByText(/Las cuentas existentes no permiten cambiar de rol/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /asignar rol|cambiar rol/i })).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalledWith('/api/v3/auth/users/4/roles', expect.anything())
  })

  it('carga médicos y especialidades desde sus endpoints y no presenta fechas inexistentes', async () => {
    renderAsAdmin(<Medicos />)
    expect(await screen.findByRole('row', { name: /Daniela Rojas/ })).toBeInTheDocument()
    expect(screen.queryByText('2024-03-15')).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/v3/doctors', expect.objectContaining({ headers: expect.any(Headers) }))
    expect(fetch).toHaveBeenCalledWith('/api/v3/specialties', expect.objectContaining({ headers: expect.any(Headers) }))
  })

  it('muestra error de servidor en el catálogo de especialidades en vez de datos locales', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))))
    renderAsAdmin(<Especialidades />)
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las especialidades desde el servidor.')
    expect(screen.queryByRole('row', { name: new RegExp(mockSpecialties[0].specialtyName) })).not.toBeInTheDocument()
  })
})
