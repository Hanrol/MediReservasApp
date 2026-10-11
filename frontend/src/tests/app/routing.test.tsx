import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '../../app/App'
import { AuthProvider } from '../../contexts/AuthContext'
import { mockUsers } from '../../data/mockUsers'
import { saveSession } from '../../storage/session.storage'
import { saveUsers } from '../../storage/users.storage'
import type { User } from '../../types/user'

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function saveUserSession(user: User) {
  saveSession({
    token: 'test-token',
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  })
}

describe('Enrutamiento de la aplicación', () => {
  beforeEach(() => {
    localStorage.clear()
    saveUsers(mockUsers)
  })

  it('CP-098 · RF-29 · redirige al login al abrir un dashboard sin sesión', () => {
    renderApp('/dashboard')

    expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
  })

  it('CP-099 · RF-05/RF-29 · permite al paciente abrir su dashboard', () => {
    const patient = mockUsers.find((user) => user.role === 'PATIENT')!
    saveUserSession(patient)

    renderApp('/dashboard')

    expect(screen.getByRole('heading', { name: `Hola, ${patient.firstName}` })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Mis citas/ }).some((link) => link.getAttribute('href') === '/mis-citas')).toBe(true)
  })

  it('CP-100 · RF-29 · dirige a acceso denegado cuando el rol no está permitido', () => {
    const patient = mockUsers.find((user) => user.role === 'PATIENT')!
    saveUserSession(patient)

    renderApp('/usuarios')

    expect(screen.getByRole('heading', { name: 'No tienes permiso para ingresar' })).toBeInTheDocument()
  })

  it('CP-101 · RF-01 · ruta desconocida vuelve a Home', () => {
    renderApp('/ruta-inexistente')

    expect(screen.getByRole('heading', { name: /Reserva tu hora médica/ })).toBeInTheDocument()
  })
})
