import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import { mockUsers } from '../../data/mockUsers'
import Contacto from '../../pages/public/Contacto'
import Home from '../../pages/public/Home'
import Login from '../../pages/public/Login'
import Registro from '../../pages/public/Registro'
import { getUsers } from '../../services/users.service'
import * as usersService from '../../services/users.service'
import { saveUsers } from '../../storage/users.storage'

function anonymousAuth() {
  return {
    session: null,
    user: undefined,
    isAuthenticated: false,
    startSession: vi.fn(),
    logout: vi.fn(),
    refreshSession: vi.fn(),
  }
}

function renderPublic(page: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={anonymousAuth()}>{page}</AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('Requisitos de las páginas públicas', () => {
  beforeEach(() => {
    localStorage.clear()
    saveUsers(mockUsers)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('CP-078 · RF-01 · Home muestra accesos a médicos, contacto y registro', () => {
    renderPublic(<Home />)

    expect(screen.getByRole('heading', { name: /Reserva tu hora médica/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Buscar un médico' })).toHaveAttribute('href', '/medicos-especialidades#medicos')
    expect(screen.getByRole('link', { name: 'Ver especialidades' })).toHaveAttribute('href', '/medicos-especialidades#especialidades')
    expect(screen.getByRole('link', { name: 'Registrarme' })).toHaveAttribute('href', '/registro')
  })

  it('CP-079 · RF-26/RF-27 · contacto muestra el mapa, valida el formulario y confirma el envío', async () => {
    const user = userEvent.setup()
    renderPublic(<Contacto />)

    expect(screen.getByTitle('Mapa de MediReservas en San Joaquín')).toBeInTheDocument()
    expect(document.body.textContent).toContain('Av. Vicuña Mackenna 4917')

    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Correo electrónico'), 'correo-invalido')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getByText('Ingresa un correo electrónico válido.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nombre'), 'Camila Torres')
    await user.clear(screen.getByLabelText('Correo electrónico'))
    await user.type(screen.getByLabelText('Correo electrónico'), 'camila@example.cl')
    await user.type(screen.getByLabelText('Asunto'), 'Consulta médica')
    await user.type(screen.getByLabelText('Mensaje'), 'Quisiera conocer los horarios de atención.')
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }))

    expect(screen.getByRole('status')).toHaveTextContent('El mensaje fue enviado correctamente.')
  })

  it('CP-080 · RF-03 · login indica los campos obligatorios', async () => {
    const user = userEvent.setup()
    renderPublic(<Login />)

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria.')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Correo electrónico'), 'paciente@medireservas.cl')
    expect(screen.queryByText('El correo electrónico es obligatorio.')).not.toBeInTheDocument()
  })

  it('CP-081 · RF-03 · login informa credenciales incorrectas', async () => {
    const user = userEvent.setup()
    renderPublic(<Login />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'paciente@medireservas.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'Incorrecta123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByText('El correo o la contraseña no son correctos, o la cuenta está inactiva.')).toBeInTheDocument()
  })

  it('CP-082 · RF-03 · login inicia sesión y redirige al panel', async () => {
    vi.useFakeTimers()
    const authValue = anonymousAuth()
    const startSession = vi.fn()

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthContext.Provider value={{ ...authValue, startSession }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<p>Panel de usuario</p>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: ' PACIENTE@MEDIRESERVAS.CL ' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Paciente123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(startSession).toHaveBeenCalledWith(expect.objectContaining({ role: 'PATIENT' }))
    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(screen.getByText('Panel de usuario')).toBeInTheDocument()
  })

  it('CP-083 · RF-02 · registro presenta errores al enviar campos vacíos', async () => {
    const user = userEvent.setup()
    renderPublic(<Registro />)

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('El RUN es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('Debes aceptar los términos para continuar.')).toBeInTheDocument()
  })

  it('CP-084 · RF-02 · registro crea una cuenta paciente con datos válidos', async () => {
    renderPublic(<Registro />)

    fireEvent.change(screen.getByLabelText('RUN'), { target: { value: '12345678-5' } })
    fireEvent.blur(screen.getByLabelText('RUN'))
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Camila' } })
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Torres' } })
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1990-05-10' } })
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '912345678' } })
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Santiago Centro' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'camila.torres@example.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Paciente123' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Paciente123' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('Cuenta creada correctamente. Ya puedes iniciar sesión.')).toBeInTheDocument()
    expect(getUsers()).toContainEqual(expect.objectContaining({
      run: '12345678-5',
      email: 'camila.torres@example.cl',
      role: 'PATIENT',
      active: true,
    }))
  })

  it('CP-123 · RF-03/RNF-02 · login enfoca la contraseña cuando falta', async () => {
    const user = userEvent.setup()
    renderPublic(<Login />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'paciente@medireservas.cl')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getByLabelText('Contraseña')).toHaveFocus()
    expect(screen.getByText('La contraseña es obligatoria.')).toBeInTheDocument()
  })

  it('CP-125 · RF-03 · login redirige al panel si ya existe una sesión activa', () => {
    const patient = mockUsers.find((item) => item.role === 'PATIENT')!
    const authValue = {
      session: {
        token: 'test-token',
        userId: patient.userId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        role: patient.role,
      },
      user: patient,
      isAuthenticated: true,
      startSession: vi.fn(),
      logout: vi.fn(),
      refreshSession: vi.fn(),
    }

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthContext.Provider value={authValue}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<p>Sesión ya iniciada</p>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Sesión ya iniciada')).toBeInTheDocument()
  })

  it('CP-139 · RF-03/RF-29 · login evita reutilizar una ruta exclusiva de otro rol', async () => {
    vi.useFakeTimers()
    const startSession = vi.fn()

    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: '/solicitar-cita' } }]}>
        <AuthContext.Provider value={{ ...anonymousAuth(), startSession }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<p>Panel de usuario</p>} />
            <Route path="/solicitar-cita" element={<p>Solicitar cita</p>} />
            <Route path="/acceso-denegado" element={<p>Acceso denegado</p>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'medico@medireservas.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Medico123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(startSession).toHaveBeenCalledWith(expect.objectContaining({ role: 'DOCTOR' }))
    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(screen.getByText('Panel de usuario')).toBeInTheDocument()
    expect(screen.queryByText('Acceso denegado')).not.toBeInTheDocument()
  })

  it('CP-126 · RF-02/RNF-07 · registro informa cuando no se puede persistir la cuenta', () => {
    vi.spyOn(usersService, 'createUser').mockImplementationOnce(() => {
      throw new Error('storage unavailable')
    })
    renderPublic(<Registro />)

    fireEvent.change(screen.getByLabelText('RUN'), { target: { value: '12345678-5' } })
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Camila' } })
    fireEvent.change(screen.getByLabelText('Apellidos'), { target: { value: 'Torres' } })
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '1990-05-10' } })
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '912345678' } })
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Santiago Centro' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'camila.failure@example.cl' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Paciente123' } })
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Paciente123' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(screen.getByText('No se pudo guardar la cuenta. Intenta nuevamente.')).toBeInTheDocument()
  })
})
