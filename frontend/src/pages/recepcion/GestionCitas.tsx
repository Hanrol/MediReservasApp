import {useEffect} from 'react'
import {Link, Navigate, useNavigate} from 'react-router-dom'
import {DASHBOARD_CONFIG} from '../../lib/roles.ts'
import {getSession, removeSession} from '../../lib/storage.ts'

// TODO: Esperar al Integrante 3 para acordar los tipos de citas/horarios y consumir appointments.service.ts.
// No conectar esta página directamente a legacy ni duplicar aquí el almacenamiento o las reglas de citas.
function GestionCitas() {
  const navigate = useNavigate()
  const session = getSession()
  const config = session ? DASHBOARD_CONFIG[session.role] : null

  useEffect(() => {
    document.title = 'Gestión de citas | MediReservas'
  }, [])

  if (!session || !config) return <Navigate to="/login" replace/>
  if (session.role !== 'ADMIN' && session.role !== 'RECEPTIONIST') return <Navigate to="/dashboard" replace/>

  function logout() {
    removeSession()
    navigate('/login', {replace: true})
  }

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      <a
        className="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0"
        href="#main-content">Saltar al contenido principal</a>
      <header className="relative z-30 border-b border-line bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
             aria-label="Barra superior de MediReservas">
          <Link className="flex items-center gap-2 text-lg font-bold text-primary-dark sm:text-xl" to="/">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white">+</span>
            <span className="hidden sm:inline">MediReservas</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link className="text-right" to="/perfil">
              <p className="text-sm font-semibold">{session.firstName} {session.lastName}</p>
              <p className="text-xs text-muted">{config.label}</p>
            </Link>
            <button
              className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-primary-dark hover:bg-red-50 hover:text-red-600"
              type="button" onClick={logout}>
              <span className="sm:hidden">Salir</span>
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8" id="main-content" tabIndex={-1}>
        <nav className="mx-auto mb-6 max-w-7xl text-sm" aria-label="Ruta de navegación">
          <ol className="flex gap-2 text-muted">
            <li><Link className="font-semibold text-primary-dark" to="/dashboard">Panel principal</Link></li>
            <li>/</li>
            <li className="font-semibold text-ink">Gestión de citas</li>
          </ol>
        </nav>
        <section className="mx-auto max-w-7xl" aria-labelledby="appointments-title">
          <header>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Recepción</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl" id="appointments-title">Gestión de
              citas</h1>
            <p className="mt-3 text-muted">Consulta las solicitudes, confirma, reagenda o cancela las citas de los
              pacientes.</p>
          </header>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
               role="status">
            <p className="font-semibold">Integración pendiente</p>
            <p className="mt-2">Esta página espera el servicio de citas y los tipos compartidos del Integrante 3. La
              gestión de citas estará disponible cuando se acuerde esa interfaz.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white px-4 py-5 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} MediReservas. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default GestionCitas
