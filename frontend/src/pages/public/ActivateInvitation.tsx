import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import FormMessage from '../../components/forms/FormMessage'
import SkipLink from '../../components/ui/SkipLink'
import { ROUTES } from '../../constants/routes'
import { ApiError } from '../../services/api-client'
import { acceptAdminInvitation } from '../../services/admin-invitations.service'
import { normalizeRun } from '../../utils/validations'

function ActivateInvitation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const [run, setRun] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    document.title = 'Activar cuenta | MediReservas'
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!token) {
      setMessage('El enlace de invitación no contiene un token válido. Solicita uno nuevo a administración.')
      return
    }
    if (!run.trim() || !firstName.trim() || !lastName.trim()) {
      setMessage('Completa tu RUN, nombre y apellidos.')
      return
    }
    if (password.length < 8 || password.length > 100) {
      setMessage('La contraseña debe tener entre 8 y 100 caracteres.')
      return
    }
    if (password !== passwordConfirmation) {
      setMessage('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)
    try {
      await acceptAdminInvitation({
        token,
        run: normalizeRun(run.trim()).toUpperCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        birthDate: birthDate || null,
        address: address.trim(),
        password,
      })
      setCompleted(true)
      setMessage('Cuenta activada. Ya puedes iniciar sesión.')
      window.setTimeout(() => navigate(ROUTES.login, { replace: true }), 1000)
    } catch (error) {
      if (error instanceof ApiError && error.status === 410) {
        setMessage('La invitación venció. Solicita un nuevo enlace a administración.')
      } else if (error instanceof ApiError && error.status === 409) {
        setMessage(error.message || 'La invitación ya fue utilizada o el RUN ya está asociado a una cuenta.')
      } else if (error instanceof ApiError && error.status === 400) {
        setMessage(error.message || 'La invitación no es válida. Solicita un nuevo enlace a administración.')
      } else if (error instanceof TypeError) {
        setMessage('No se pudo conectar con el servidor. Intenta nuevamente.')
      } else {
        setMessage('No se pudo activar la cuenta. Intenta nuevamente o solicita ayuda a administración.')
      }
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-page text-ink antialiased">
      <SkipLink />
      <header className="border-b border-line bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Activación de cuenta">
          <Link className="flex items-center gap-2 text-xl font-bold text-primary-dark" to={ROUTES.home}>
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white" aria-hidden="true">+</span>
            MediReservas
          </Link>
        </nav>
      </header>

      <main className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8" id="main-content" tabIndex={-1}>
        <section className="mx-auto max-w-2xl rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-10" aria-labelledby="activation-title">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Invitación de MediReservas</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="activation-title">Activa tu cuenta</h1>
          <p className="mt-3 leading-7 text-muted">Completa tus datos generales y crea una contraseña personal para ingresar.</p>

          <form className="mt-8 grid gap-5 sm:grid-cols-2" noValidate onSubmit={handleSubmit}>
            <label className="text-sm font-semibold">RUN<input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" autoComplete="off" maxLength={12} required value={run} onChange={(event) => setRun(event.target.value)} /></label>
            <label className="text-sm font-semibold">Nombre<input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" autoComplete="given-name" maxLength={80} required value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
            <label className="text-sm font-semibold">Apellidos<input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" autoComplete="family-name" maxLength={80} required value={lastName} onChange={(event) => setLastName(event.target.value)} /></label>
            <label className="text-sm font-semibold">Teléfono<input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" autoComplete="tel" maxLength={20} value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
            <label className="text-sm font-semibold">Fecha de nacimiento<input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" type="date" autoComplete="bday" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} /></label>
            <label className="text-sm font-semibold sm:col-span-2">Dirección<input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" autoComplete="street-address" maxLength={150} value={address} onChange={(event) => setAddress(event.target.value)} /></label>
            <label className="text-sm font-semibold">Contraseña<input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" type="password" autoComplete="new-password" minLength={8} maxLength={100} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <label className="text-sm font-semibold">Confirma tu contraseña<input className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal outline-none focus:border-primary" type="password" autoComplete="new-password" minLength={8} maxLength={100} required value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} /></label>
            <div className="sm:col-span-2">
              <FormMessage className={completed ? 'text-primary-dark' : ''}>{message}</FormMessage>
              <button className="mt-3 w-full rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting || completed}>
                {isSubmitting ? 'Activando cuenta…' : completed ? 'Cuenta activada' : 'Activar cuenta'}
              </button>
            </div>
          </form>
          <p className="mt-6 text-sm text-muted">¿Ya activaste tu cuenta? <Link className="font-semibold text-primary-dark" to={ROUTES.login}>Inicia sesión</Link></p>
        </section>
      </main>
    </div>
  )
}

export default ActivateInvitation
