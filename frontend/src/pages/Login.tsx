import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authenticate, createSession } from '../lib/auth'
import { initializeBaseUsers } from '../lib/storage'
import type { LoginErrors, LoginValues } from '../lib/types'
import { validateLogin } from '../lib/validations'

const initialValues: LoginValues = { email: '', password: '' }

function Login() {
  const navigate = useNavigate()
  const timerRef = useRef<number | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Iniciar sesión | MediReservas'
    initializeBaseUsers()
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  function updateField(field: keyof LoginValues, value: string) {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)
    if (errors[field]) setErrors(validateLogin(nextValues))
    setMessage('')
  }

  function validateField(field: keyof LoginValues) {
    const nextErrors = validateLogin(values)
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedValues = { ...values, email: values.email.trim().toLowerCase() }
    const nextErrors = validateLogin(normalizedValues)
    setValues(normalizedValues)
    setErrors(nextErrors)
    setMessage('')

    if (Object.keys(nextErrors).length) {
      if (nextErrors.email) emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }

    const user = authenticate(normalizedValues.email, normalizedValues.password)
    if (!user) {
      setMessage('El correo o la contraseña no son correctos, o la cuenta está inactiva.')
      return
    }

    createSession(user)
    setIsSubmitting(true)
    setMessage('Sesión iniciada. Redirigiendo al panel...')
    timerRef.current = window.setTimeout(() => navigate('/dashboard'), 500)
  }

  return (
    <div className="min-h-screen bg-page text-ink antialiased">
      <a className="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0" href="#main-content">
        Saltar al contenido principal
      </a>
      <header className="border-b border-line bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Navegación de inicio de sesión">
          <Link className="flex items-center gap-2 text-xl font-bold text-primary-dark" to="/" aria-label="Volver al inicio de MediReservas">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white" aria-hidden="true">+</span>
            <span>MediReservas</span>
          </Link>
          <p className="text-sm text-muted">
            <span className="hidden sm:inline">¿No tienes una cuenta?</span>
            <Link className="ml-1 font-semibold text-primary-dark hover:text-primary" to="/registro">Regístrate</Link>
          </p>
        </nav>
      </header>

      <main className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8" id="main-content" tabIndex={-1}>
        <section className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-line bg-white shadow-xl lg:grid-cols-2" aria-labelledby="login-title">
          <div className="p-6 sm:p-10 lg:p-12">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Acceso a MediReservas</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="login-title">Inicia sesión</h1>
            <p className="mt-3 leading-7 text-muted">Ingresa tus credenciales para acceder a las funciones disponibles para tu perfil.</p>

            <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="email">Correo electrónico</label>
                <input
                  ref={emailRef}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={100}
                  placeholder="nombre@correo.cl"
                  aria-describedby="email-error"
                  aria-invalid={Boolean(errors.email)}
                  value={values.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  onBlur={() => validateField('email')}
                />
                <p className="mt-1.5 min-h-5 text-sm text-red-600" id="email-error" role="alert">{errors.email}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="password">Contraseña</label>
                <input
                  ref={passwordRef}
                  className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-3 focus:ring-emerald-100"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  minLength={6}
                  maxLength={100}
                  aria-describedby="password-error"
                  aria-invalid={Boolean(errors.password)}
                  value={values.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  onBlur={() => validateField('password')}
                />
                <p className="mt-1.5 min-h-5 text-sm text-red-600" id="password-error" role="alert">{errors.password}</p>
              </div>

              <button className="w-full rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:ring-3 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
              <p className={`text-center text-sm font-medium ${isSubmitting ? 'text-primary-dark' : 'text-red-600'}`} role="status">{message}</p>
            </form>

            <p className="mt-6 text-center text-sm text-muted sm:hidden">
              ¿Aún no tienes una cuenta? <Link className="font-semibold text-primary-dark" to="/registro">Crear cuenta</Link>
            </p>
          </div>

          <aside className="flex flex-col justify-between bg-primary-dark p-6 text-white sm:p-10 lg:p-12" aria-labelledby="benefits-title">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">Tu espacio de salud</p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl" id="benefits-title">Todo lo que necesitas en un solo lugar</h2>
              <p className="mt-4 leading-7 text-emerald-50">Accede de forma rápida a tus atenciones y mantén organizada tu información médica.</p>
              <ul className="mt-8 space-y-4 text-sm">
                {['Consulta tus próximas citas.', 'Gestiona tus atenciones médicas.', 'Accede según tu perfil de usuario.'].map((benefit) => (
                  <li className="flex items-center gap-3" key={benefit}>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 font-bold" aria-hidden="true">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-10 rounded-xl bg-white/10 p-4 text-sm leading-6 text-emerald-50">Tu información de acceso es personal. No compartas tu contraseña con otras personas.</p>
          </aside>
        </section>
      </main>

      <footer className="px-4 pb-8 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} MediReservas. Todos los derechos reservados.</p>
        <Link className="mt-2 inline-flex font-semibold text-primary-dark hover:text-primary" to="/">Volver al inicio</Link>
      </footer>
    </div>
  )
}

export default Login
