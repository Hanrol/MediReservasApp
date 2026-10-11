import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { AppointmentStatus } from '../../components/appointments/AppointmentStatus'
import { ScheduleSelector } from '../../components/appointments/ScheduleSelector'
import PublicHeader from '../../components/layout/PublicHeader'
import Modal from '../../components/ui/Modal'
import { AuthContext } from '../../contexts/auth-context'

const anonymousAuth = {
  session: null,
  user: undefined,
  isAuthenticated: false,
  startSession: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
}

describe('Navegación y componentes compartidos', () => {
  it('CP-048 · RF-28/RNF-03 · menú público contiene navegación y botón responsive', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={anonymousAuth}>
          <PublicHeader currentPage="home" />
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir menú principal' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('CP-049 · RF-28 · botón hamburguesa muestra y oculta el menú móvil', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={anonymousAuth}>
          <PublicHeader currentPage="home" />
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    const button = screen.getByRole('button', { name: 'Abrir menú principal' })
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar menú principal' }))
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('CP-050 · RNF-08 · modal cierra con Escape y restaura el desplazamiento', () => {
    const onClose = vi.fn()
    const { unmount } = render(<Modal title="Confirmar acción" onClose={onClose}>Contenido</Modal>)

    expect(screen.getByRole('dialog')).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('CP-051 · RF-20/RF-22 · estado de cita presenta una etiqueta comprensible', () => {
    render(<AppointmentStatus status="CONFIRMED" />)
    expect(screen.getByText('Confirmada')).toBeInTheDocument()
  })

  it('CP-052 · RF-15/RF-16 · selector comunica cambios y horarios disponibles', async () => {
    const onDateChange = vi.fn()
    const onTimeChange = vi.fn()
    render(
      <ScheduleSelector
        date="2026-10-12"
        time=""
        availableTimes={['09:30', '10:00']}
        onDateChange={onDateChange}
        onTimeChange={onTimeChange}
      />,
    )

    await userEvent.selectOptions(screen.getByLabelText(/Hora de atención/), '10:00')
    expect(onTimeChange).toHaveBeenCalledWith('10:00')
  })
})
