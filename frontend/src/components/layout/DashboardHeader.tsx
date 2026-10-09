import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../hooks/useAuth'
import { DASHBOARD_CONFIG } from '../../lib/roles'

interface DashboardHeaderProps {
  menuOpen: boolean
  onOpenMenu: () => void
}

function DashboardHeader({ menuOpen, onOpenMenu }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const config = user ? DASHBOARD_CONFIG[user.role] : null

  if (!user || !config) return null

  return (
    <header className="relative z-30 border-b border-line bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8" aria-label="Barra superior de MediReservas">
        <div className="flex items-center gap-3 lg:pl-8">
          <button
            className="grid size-10 place-items-center rounded-xl border border-line bg-white text-xl text-primary-dark transition hover:bg-primary-light lg:hidden"
            type="button"
            aria-expanded={menuOpen}
            aria-label="Abrir menú de navegación"
            onClick={onOpenMenu}
          >
            ☰
          </button>
          <Link className="flex items-center gap-2 text-lg font-bold text-primary-dark sm:text-xl" to={ROUTES.home} aria-label="Ir al inicio de MediReservas">
            <span className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white" aria-hidden="true">+</span>
            <span className="hidden sm:inline">MediReservas</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link className="text-right" to={ROUTES.profile} aria-label="Ver mi perfil">
            <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted">{config.label}</p>
          </Link>
          <button
            className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-primary-dark transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:px-4"
            type="button"
            onClick={logout}
          >
            <span className="sm:hidden">Salir</span>
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </nav>
    </header>
  )
}

export default DashboardHeader
