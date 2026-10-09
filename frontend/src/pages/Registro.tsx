import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormMessage from '../components/forms/FormMessage'
import SkipLink from '../components/ui/SkipLink'
import { ROUTES } from '../constants/routes'
import { getNextUserId, initializeBaseUsers, saveUser, userExists } from '../lib/storage'
import type { RegistrationErrors, RegistrationValues } from '../lib/types'
import { getLocalDateString, normalizeRun, validateRegistration } from '../lib/validations'

const initialValues: RegistrationValues = {
  run: '', firstName: '', lastName: '', birthDate: '', phone: '', address: '',
  email: '', password: '', passwordConfirmation: '', terms: false,
}

const personalFields = [
  { name: 'run', id: 'run', label: 'RUN', type: 'text', autoComplete: 'off', maxLength: 12 },
  { name: 'firstName', id: 'first-name', label: 'Nombre', type: 'text', autoComplete: 'given-name', maxLength: 80 },
  { name: 'lastName', id: 'last-name', label: 'Apellidos', type: 'text', autoComplete: 'family-name', maxLength: 80 },
  { name: 'birthDate', id: 'birth-date', label: 'Fecha de nacimiento', type: 'date', autoComplete: 'bday' },
  { name: 'phone', id: 'phone', label: 'Teléfono', type: 'tel', autoComplete: 'tel', maxLength: 20, placeholder: '+56 9 1234 5678' },
  { name: 'address', id: 'address', label: 'Dirección', type: 'text', autoComplete: 'street-address', maxLength: 150 },
] as const

const accessFields = [
  { name: 'email', id: 'email', label: 'Correo electrónico', type: 'email', autoComplete: 'email', maxLength: 100, placeholder: 'nombre@correo.cl' },
  { name: 'password', id: 'password', label: 'Contraseña', type: 'password', autoComplete: 'new-password', maxLength: 100 },
  { name: 'passwordConfirmation', id: 'password-confirmation', label: 'Confirmar contraseña', type: 'password', autoComplete: 'new-password', maxLength: 100 },
] as const

function Registro() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<RegistrationErrors>({})
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Crear cuenta | MediReservas'
    initializeBaseUsers()
    return () => { if (timerRef.current !== null) clearTimeout(timerRef.current) }
  }, [])

  function validateField(name: keyof RegistrationValues, nextValues = values) {
    setErrors((current) => ({ ...current, [name]: validateRegistration(nextValues)[name] }))
  }

  function changeField(name: keyof RegistrationValues, value: string | boolean) {
    const next = { ...values, [name]: value }
    setValues(next)
    setMessage('')
    if (errors[name] || name === 'terms') validateField(name, next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitted) return
    const normalized = {
      ...values, run: normalizeRun(values.run), firstName: values.firstName.trim(),
      lastName: values.lastName.trim(), phone: values.phone.trim(), address: values.address.trim(),
      email: values.email.trim().toLowerCase(),
    }
    const nextErrors = validateRegistration(normalized)
    setValues(normalized)
    setErrors(nextErrors)
    setMessage('')
    if (Object.keys(nextErrors).length) {
      const field = formRef.current?.elements.namedItem(Object.keys(nextErrors)[0])
      if (field instanceof HTMLInputElement) field.focus()
      return
    }
    try {
      if (userExists(normalized.run, normalized.email)) {
        setMessage('Ya existe una cuenta asociada a este RUN o correo.')
        return
      }
      const userId = getNextUserId()
      saveUser({
        userId, authUserId: userId, run: normalized.run, firstName: normalized.firstName,
        lastName: normalized.lastName, birthDate: normalized.birthDate, phone: normalized.phone,
        address: normalized.address, email: normalized.email, password: normalized.password,
        role: 'PATIENT', active: true,
      })
      setSubmitted(true)
      setValues(initialValues)
      setMessage('Cuenta creada correctamente. Ya puedes iniciar sesión.')
      timerRef.current = setTimeout(() => navigate(ROUTES.login), 800)
    } catch {
      setMessage('No se pudo guardar la cuenta. Intenta nuevamente.')
    }
  }

  function renderField(field: (typeof personalFields)[number] | (typeof accessFields)[number]) {
    return (
      <div key={field.name} className={field.name === 'email' ? 'sm:col-span-2' : undefined}>
        <label className="mb-2 block text-sm font-semibold" htmlFor={field.id}>{field.label}</label>
        <input
          className={`w-full rounded-xl border ${errors[field.name] ? 'border-red-500' : 'border-line'} bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100`}
          id={field.id} name={field.name} type={field.type} autoComplete={field.autoComplete}
          maxLength={'maxLength' in field ? field.maxLength : undefined}
          placeholder={'placeholder' in field ? field.placeholder : undefined}
          max={field.name === 'birthDate' ? getLocalDateString() : undefined}
          minLength={field.type === 'password' ? 6 : undefined}
          aria-describedby={field.name === 'run' ? 'run-help run-error' : `${field.id}-error`}
          aria-invalid={Boolean(errors[field.name])} value={values[field.name]} disabled={submitted}
          onChange={(event) => changeField(field.name, event.target.value)}
          onBlur={() => {
            const next = field.name === 'run' ? { ...values, run: normalizeRun(values.run) } : values
            if (field.name === 'run') setValues(next)
            validateField(field.name, next)
          }}
        />
        {field.name === 'run' && <p className="mt-1.5 text-xs text-muted" id="run-help">Escríbelo sin puntos y con guion.</p>}
        <FormMessage id={`${field.id}-error`}>{errors[field.name]}</FormMessage>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page text-ink antialiased">
      <SkipLink />
      <header className="border-b border-line bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Navegación de registro">
          <Link className="flex items-center gap-2 text-xl font-bold text-primary-dark" to={ROUTES.home} aria-label="Volver al inicio de MediReservas">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white" aria-hidden="true">+</span>
            <span>MediReservas</span>
          </Link>
          <p className="text-sm text-muted"><span className="hidden sm:inline">¿Ya tienes una cuenta?</span><Link className="ml-1 font-semibold text-primary-dark hover:text-primary" to={ROUTES.login}>Inicia sesión</Link></p>
        </nav>
      </header>
      <main className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8" id="main-content" tabIndex={-1}>
        <section className="mx-auto max-w-4xl" aria-labelledby="register-title">
          <div className="mb-8 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Registro de pacientes</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="register-title">Crea tu cuenta</h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted">Ingresa tus datos personales para comenzar a gestionar tus horas médicas.</p>
          </div>
          <form className="space-y-8 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-8 lg:p-10" id="register-form" noValidate ref={formRef} onSubmit={handleSubmit}>
            <fieldset><legend className="mb-6 text-xl font-bold text-primary-dark">Datos personales</legend><div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{personalFields.map(renderField)}</div></fieldset>
            <div className="h-px bg-line" />
            <fieldset><legend className="mb-6 text-xl font-bold text-primary-dark">Datos de acceso</legend><div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{accessFields.map(renderField)}</div></fieldset>
            <div>
              <div className="flex items-start gap-3">
                <input className="mt-1 size-4 accent-primary" id="terms" name="terms" type="checkbox" aria-describedby="terms-error" aria-invalid={Boolean(errors.terms)} checked={values.terms} disabled={submitted} onChange={(event) => changeField('terms', event.target.checked)} />
                <label className="text-sm leading-6 text-muted" htmlFor="terms">Acepto los términos de uso y la política de privacidad.</label>
              </div>
              <FormMessage id="terms-error">{errors.terms}</FormMessage>
            </div>
            <button className="w-full rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:ring-3 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitted}>Crear cuenta</button>
            <p className={`text-center text-sm font-medium ${submitted ? 'text-primary-dark' : 'text-red-600'}`} id="register-message" role="status">{message}</p>
          </form>
        </section>
      </main>
      <footer className="px-4 pb-8 text-center text-sm text-muted">
        <p>&copy; {new Date().getFullYear()} MediReservas. Todos los derechos reservados.</p>
        <Link className="mt-2 inline-flex font-semibold text-primary-dark hover:text-primary" to={ROUTES.home}>Volver al inicio</Link>
      </footer>
    </div>
  )
}

export default Registro
