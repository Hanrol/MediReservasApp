import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ActivateInvitation from '../../pages/public/ActivateInvitation'

describe('Activación por invitación', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('muestra el motivo del servidor si debe recuperar una activación anterior', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: 409,
      message: 'Usa la contraseña elegida en el intento anterior.',
      data: null,
    }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    render(
      <MemoryRouter initialEntries={['/activar-cuenta?token=invite-token']}>
        <ActivateInvitation />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('RUN'), { target: { value: '12345678-5' } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Paciente' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'same-password-123' } })
    fireEvent.change(screen.getByLabelText('Confirma tu contraseña'), { target: { value: 'same-password-123' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Activar cuenta' }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('Usa la contraseña elegida en el intento anterior.')).toBeInTheDocument()
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/v3/invitations/accept', expect.objectContaining({ method: 'POST' }))
  })
})
