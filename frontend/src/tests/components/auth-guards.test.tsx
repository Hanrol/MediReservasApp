import { useState } from 'react'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../../contexts/AuthContext'
import AuthGuard from '../../guards/AuthGuard'
import RoleGuard from '../../guards/RoleGuard'
import { useAuth } from '../../hooks/useAuth'
import { useMobileMenu } from '../../hooks/useMobileMenu'
import { mockUsers } from '../../data/mockUsers'
import { saveSession } from '../../storage/session.storage'
import { saveUsers } from '../../storage/users.storage'

vi.mock('../../hooks/useAuth', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../hooks/useAuth')>()
  return { ...original, useAuth: vi.fn(original.useAuth) }
})

const mockedUseAuth = vi.mocked(useAuth)

function guardAuth(role: 'ADMIN' | 'PATIENT' = 'PATIENT', authenticated = true) {
  const user = mockUsers.find((item) => item.role === role)
  mockedUseAuth.mockReturnValue({
    session: authenticated && user ? {
      token: 'test-token',
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    } : null,
    user: authenticated ? user : undefined,
    isAuthenticated: authenticated,
    startSession: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
  })
}

function AuthConsumer() {
  const auth = useAuth()
  const location = useLocation()
  const [, rerender] = useState(0)

  return (
    <>
      <p>{auth.isAuthenticated ? auth.user?.email : 'Sin sesión'}</p>
      <p data-testid="location">{location.pathname}</p>
      <button type="button" onClick={() => { auth.startSession(mockUsers[3]); rerender((value) => value + 1) }}>Iniciar</button>
      <button type="button" onClick={auth.logout}>Cerrar</button>
    </>
  )
}

describe('Protección de rutas y sesión', () => {
  beforeEach(() => {
    localStorage.clear()
    saveUsers(mockUsers)
    mockedUseAuth.mockReset()
  })

  it('CP-041 · RF-29 · redirige al login sin autenticación', () => {
    guardAuth('PATIENT', false)
    render(
      <MemoryRouter initialEntries={['/privado']}>
        <Routes>
          <Route path="/privado" element={<AuthGuard><p>Contenido privado</p></AuthGuard>} />
          <Route path="/login" element={<p>Página de login</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Página de login')).toBeInTheDocument()
  })

  it('CP-042 · RF-29 · permite una ruta autenticada', () => {
    guardAuth()
    render(<MemoryRouter><AuthGuard><p>Contenido privado</p></AuthGuard></MemoryRouter>)
    expect(screen.getByText('Contenido privado')).toBeInTheDocument()
  })

  it('CP-043 · RF-29/RNF-04 · bloquea un rol no autorizado', () => {
    guardAuth('PATIENT')
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<RoleGuard allowedRoles={['ADMIN']}><p>Administración</p></RoleGuard>} />
          <Route path="/acceso-denegado" element={<p>Acceso denegado</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
  })

  it('CP-044 · RF-05/RF-29 · permite la vista correspondiente al rol', () => {
    guardAuth('ADMIN')
    render(<MemoryRouter><RoleGuard allowedRoles={['ADMIN']}><p>Administración</p></RoleGuard></MemoryRouter>)
    expect(screen.getByText('Administración')).toBeInTheDocument()
  })

  it('CP-045 · RF-03 · AuthProvider inicia una sesión', async () => {
    mockedUseAuth.mockImplementation((await vi.importActual<typeof import('../../hooks/useAuth')>('../../hooks/useAuth')).useAuth)
    render(<MemoryRouter><AuthProvider><AuthConsumer /></AuthProvider></MemoryRouter>)

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar' }))
    expect(screen.getByText('paciente@medireservas.cl')).toBeInTheDocument()
  })

  it('CP-046 · RF-04 · cerrar sesión elimina datos y redirige al login', async () => {
    const patient = mockUsers[3]
    saveSession({
      token: 'test-token',
      userId: patient.userId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      role: patient.role,
    })
    mockedUseAuth.mockImplementation((await vi.importActual<typeof import('../../hooks/useAuth')>('../../hooks/useAuth')).useAuth)
    render(<MemoryRouter initialEntries={['/dashboard']}><AuthProvider><AuthConsumer /></AuthProvider></MemoryRouter>)

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/login')
    expect(localStorage.getItem('medireservas_session')).toBeNull()
  })

  it('CP-047 · RF-28 · menú móvil abre, alterna y cierra con Escape', () => {
    const { result } = renderHook(() => useMobileMenu<HTMLElement>())

    act(() => result.current.openMenu())
    expect(result.current.menuOpen).toBe(true)
    act(() => fireEvent.keyDown(document, { key: 'Escape' }))
    expect(result.current.menuOpen).toBe(false)
    act(() => result.current.toggleMenu())
    expect(result.current.menuOpen).toBe(true)
  })
})
