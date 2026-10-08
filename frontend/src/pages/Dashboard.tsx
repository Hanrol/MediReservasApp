import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { DASHBOARD_CONFIG, type DashboardAction } from '../lib/roles'
import { getSession, getStoredItems, getUsers, removeSession } from '../lib/storage'

interface Appointment {
  appointmentStatus?: string
  doctorId?: number
  patientUserId?: number
  date?: string
}

interface Doctor {
  doctorId?: number
  userId?: number
}

interface Specialty {
  active?: boolean
}

function ActionLink({ action, compact = false, onClick }: { action: DashboardAction; compact?: boolean; onClick?: () => void }) {
  const className = compact
    ? 'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted transition hover:bg-primary-light hover:text-primary-dark'
    : 'group rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-lg'
  const content = (
    <>
      <span className={compact ? 'grid size-7 shrink-0 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark' : 'grid size-11 place-items-center rounded-xl bg-primary-light text-sm font-bold text-primary-dark'} aria-hidden="true">{action.icon}</span>
      {compact ? <span>{action.title}</span> : (
        <div>
          <h3 className="mt-5 text-lg font-bold group-hover:text-primary-dark">{action.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{action.description}</p>
        </div>
      )}
    </>
  )
  return action.reactRoute
    ? <Link className={className} to={action.href} onClick={onClick}>{content}</Link>
    : <a className={className} href={action.href} onClick={onClick}>{content}</a>
}

function getSummary(role: string, userId: number) {
  const users = getUsers()
  const appointments = getStoredItems<Appointment>('medireservas_appointments')
  const doctors = getStoredItems<Doctor>('medireservas_doctors')
  const specialties = getStoredItems<Specialty>('medireservas_specialties')
  const today = new Date().toISOString().slice(0, 10)

  if (role === 'ADMIN') return [
    { value: new Set(users.map((user) => user.role)).size, label: 'Perfiles del sistema' },
    { value: users.filter((user) => user.active).length, label: 'Usuarios activos' },
    { value: specialties.filter((specialty) => specialty.active).length, label: 'Especialidades activas' },
  ]
  if (role === 'RECEPTIONIST') return [
    { value: appointments.filter((item) => item.appointmentStatus === 'PENDING').length, label: 'Citas pendientes' },
    { value: appointments.filter((item) => item.appointmentStatus === 'CONFIRMED').length, label: 'Citas confirmadas' },
    { value: appointments.filter((item) => item.appointmentStatus === 'CANCELLED').length, label: 'Citas canceladas' },
  ]
  if (role === 'DOCTOR') {
    const doctorId = doctors.find((doctor) => doctor.userId === userId)?.doctorId
    const ownAppointments = appointments.filter((item) => item.doctorId === doctorId)
    return [
      { value: ownAppointments.filter((item) => item.date === today && item.appointmentStatus !== 'CANCELLED').length, label: 'Atenciones de hoy' },
      { value: ownAppointments.filter((item) => item.appointmentStatus === 'CONFIRMED' && (item.date ?? '') <= today).length, label: 'Observaciones pendientes' },
      { value: ownAppointments.filter((item) => item.appointmentStatus === 'COMPLETED').length, label: 'Atenciones completadas' },
    ]
  }
  const ownAppointments = appointments.filter((item) => item.patientUserId === userId)
  return [
    { value: ownAppointments.filter((item) => (item.date ?? '') >= today && !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(item.appointmentStatus ?? '')).length, label: 'Próximas citas' },
    { value: ownAppointments.filter((item) => item.appointmentStatus === 'PENDING').length, label: 'Solicitudes pendientes' },
    { value: ownAppointments.filter((item) => item.appointmentStatus === 'COMPLETED').length, label: 'Atenciones realizadas' },
  ]
}

function Dashboard() {
  const navigate = useNavigate()
  const session = getSession()
  const config = session ? DASHBOARD_CONFIG[session.role] : null
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (config) document.title = `Panel de ${config.label} | MediReservas`
  }, [config])

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', menuOpen)
    return () => document.body.classList.remove('overflow-hidden')
  }, [menuOpen])

  if (!session || !config) return <Navigate to="/login" replace />

  const navigation: DashboardAction[] = [
    { icon: '⌂', title: 'Panel principal', href: '/dashboard', reactRoute: true, description: '' },
    { icon: 'MI', title: 'Mi perfil', href: '/perfil', reactRoute: true, description: '' },
    ...config.actions,
  ]
  const summary = getSummary(session.role, session.userId)

  function logout() {
    removeSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      <a className="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0" href="#main-content">Saltar al contenido principal</a>
      <header className="relative z-30 border-b border-line bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8" aria-label="Barra superior del panel">
          <div className="flex items-center gap-3 lg:pl-8">
            <button className="grid size-10 place-items-center rounded-xl border border-line bg-white text-xl text-primary-dark transition hover:bg-primary-light lg:hidden" type="button" aria-expanded={menuOpen} aria-label="Abrir menú de navegación" onClick={() => setMenuOpen(true)}>☰</button>
            <Link className="flex items-center gap-2 text-lg font-bold text-primary-dark sm:text-xl" to="/" aria-label="Ir al inicio de MediReservas">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white" aria-hidden="true">+</span>
              <span className="hidden sm:inline">MediReservas</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link className="text-right" to="/perfil" aria-label="Ver mi perfil">
              <p className="text-sm font-semibold">{session.firstName} {session.lastName}</p>
              <p className="text-xs text-muted">{config.label}</p>
            </Link>
            <button className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-primary-dark transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:px-4" type="button" onClick={logout}>
              <span className="sm:hidden">Salir</span><span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </nav>
      </header>

      <button className={`fixed inset-0 z-40 bg-slate-950/45 lg:hidden ${menuOpen ? '' : 'hidden'}`} type="button" aria-label="Cerrar menú de navegación" onClick={() => setMenuOpen(false)} />
      <div className="grid w-full flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-line bg-white px-5 py-5 shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:overflow-visible lg:px-5 lg:py-8 lg:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Menú del panel">
          <header className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-5 lg:hidden">
            <p className="font-bold text-primary-dark">Menú principal</p>
            <button className="grid size-10 place-items-center rounded-xl border border-line text-xl text-muted" type="button" aria-label="Cerrar menú de navegación" onClick={() => setMenuOpen(false)}>×</button>
          </header>
          <nav className="lg:sticky lg:top-8">
            <p className="mb-3 hidden px-3 text-xs font-bold uppercase tracking-widest text-muted lg:block">Navegación</p>
            <ul className="flex flex-col gap-2">
              {navigation.map((item) => <li key={item.title}><ActionLink action={item} compact onClick={() => setMenuOpen(false)} /></li>)}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12" id="main-content" tabIndex={-1}>
          <section className="rounded-3xl bg-primary-dark p-6 text-white shadow-lg sm:p-8" aria-labelledby="welcome-title">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-200">Panel de {config.label.toLowerCase()}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="welcome-title">Hola, {session.firstName}</h1>
            <p className="mt-3 max-w-2xl leading-7 text-emerald-50">{config.description}</p>
          </section>

          <section className="mt-10" aria-labelledby="quick-access-title">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Funciones</p>
            <h2 className="mt-2 text-2xl font-bold" id="quick-access-title">Accesos principales</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {config.actions.map((action) => <ActionLink action={action} key={action.title} />)}
            </div>
          </section>

          <section className="mt-10" aria-labelledby="summary-title">
            <h2 className="text-2xl font-bold" id="summary-title">Resumen</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {summary.map((item) => (
                <article className="rounded-2xl border border-line bg-white p-5 shadow-sm" key={item.label}>
                  <p className="text-3xl font-bold text-primary-dark">{item.value}</p>
                  <p className="mt-1 text-sm text-muted">{item.label}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>

      <footer className="border-t border-line bg-white px-4 py-5 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} MediReservas. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default Dashboard
