import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
import type { Role } from '../../types/role'
import type { User } from '../../types/user'

const apiUsers = mockUsers.map(({ userId, authUserId, run, email, active }) => ({
  userId, authUserId, run, email, active,
}))
const authUsers = mockUsers.map(({ authUserId, email, active, role }) => ({
  authUserId, email, enabled: active, createdAt: '2024-01-01 10:00:00', roles: [role],
}))
let currentAuthUsers = authUsers
let currentInvitations: Array<{ invitationId: number; email: string; role: Role; expiresAt: string; status: 'PENDING' | 'EXPIRED' | 'CANCELED' }> = []
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
  if (url.includes('/admin/invitations') && init?.method === 'POST') {
    if (url.endsWith('/resend')) return response({ invitationId: 10, email: 'invite@example.cl', role: 'DOCTOR', token: 'renewed-token', expiresAt: '2026-11-14T12:00:00' })
    return response({ invitationId: 10, email: 'invite@example.cl', role: 'DOCTOR', token: 'invite-token', expiresAt: '2026-11-14T12:00:00' }, 201)
  }
  if (url.includes('/admin/invitations/') && init?.method === 'PATCH') return response(null)
  if (url.endsWith('/admin/invitations')) return response(currentInvitations)
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
    currentInvitations = []
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

  it('permite renovar el enlace de invitación y presenta el nuevo token para copiar', async () => {
    const user = userEvent.setup()
    currentInvitations = [{ invitationId: 19, email: 'invite@example.cl', role: 'DOCTOR', expiresAt: '2026-11-14T12:00:00', status: 'EXPIRED' }]
    const fetchMock = vi.fn(defaultFetch)
    vi.stubGlobal('fetch', fetchMock)
    renderAsAdmin(<Usuarios />)

    const invitationRow = await screen.findByRole('row', { name: /invite@example\.cl/ })
    await user.click(within(invitationRow).getByRole('button', { name: 'Reenviar enlace' }))

    expect((await screen.findByLabelText('Enlace de activación')).getAttribute('value')).toContain('renewed-token')
    expect(fetchMock).toHaveBeenCalledWith('/api/v3/admin/invitations/19/resend', expect.objectContaining({ method: 'POST' }))
  })

  it('permite cancelar una invitación pendiente', async () => {
    const user = userEvent.setup()
    currentInvitations = [{ invitationId: 20, email: 'cancel@example.cl', role: 'RECEPTIONIST', expiresAt: '2026-11-14T12:00:00', status: 'PENDING' }]
    const fetchMock = vi.fn(defaultFetch)
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('confirm', vi.fn(() => true))
    renderAsAdmin(<Usuarios />)

    const invitationRow = await screen.findByRole('row', { name: /cancel@example\.cl/ })
    await user.click(within(invitationRow).getByRole('button', { name: 'Cancelar' }))

    expect(fetchMock).toHaveBeenCalledWith('/api/v3/admin/invitations/20/cancel', expect.objectContaining({ method: 'PATCH' }))
  })

  it('carga médicos y especialidades desde sus endpoints y no presenta fechas inexistentes', async () => {
    renderAsAdmin(<Medicos />)
    expect(await screen.findByRole('row', { name: /Daniela Rojas/ })).toBeInTheDocument()
    expect(screen.queryByText('2024-03-15')).not.toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith('/api/v3/doctors', expect.objectContaining({ headers: expect.any(Headers) }))
    expect(fetch).toHaveBeenCalledWith('/api/v3/specialties', expect.objectContaining({ headers: expect.any(Headers) }))
  })

  it('edita un médico manteniendo su usuario y permite agregar especialidades', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn(defaultFetch)
    vi.stubGlobal('fetch', fetchMock)
    renderAsAdmin(<Medicos />)

    const doctor = mockDoctors[0]
    const row = await screen.findByRole('row', { name: /Daniela Rojas/ })
    await user.click(within(row).getByRole('button', { name: 'Editar' }))

    const associatedUser = screen.getByLabelText('Usuario asociado') as HTMLSelectElement
    expect(associatedUser).toBeDisabled()
    expect(associatedUser.value).toBe(String(doctor.userId))
    expect(associatedUser.selectedOptions[0].textContent).toMatch(/Daniela Rojas/)

    const additional = screen.getByRole('checkbox', { name: /Traumatología/ })
    await user.click(additional)
    await user.click(screen.getByRole('button', { name: 'Guardar médico' }))

    await waitFor(() => {
      const update = fetchMock.mock.calls.find(([input, init]) =>
        String(input).endsWith(`/doctors/${doctor.doctorId}`) && init?.method === 'PUT',
      )
      expect(update).toBeDefined()
      expect(JSON.parse(String(update?.[1]?.body))).toMatchObject({
        userId: doctor.userId,
        specialtyIds: expect.arrayContaining([1, 3, 5]),
      })
    })
  })

  it('muestra error de servidor en el catálogo de especialidades en vez de datos locales', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))))
    renderAsAdmin(<Especialidades />)
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudieron cargar las especialidades desde el servidor.')
    expect(screen.queryByRole('row', { name: new RegExp(mockSpecialties[0].specialtyName) })).not.toBeInTheDocument()
  })
})
