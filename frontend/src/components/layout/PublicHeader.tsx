import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useMobileMenu } from '../../hooks/useMobileMenu'

type PublicPage = 'home' | 'directory' | 'contact'

interface PublicHeaderProps {
  currentPage: PublicPage
  medicalDirectoryHref?: string
  contactHref?: string
}

function PublicHeader({
  currentPage,
  medicalDirectoryHref = '/medicos-especialidades',
  contactHref = '/contacto',
}: PublicHeaderProps) {
  const { isAuthenticated } = useAuth()
  const { menuOpen, menuContainer, closeMenu, toggleMenu } = useMobileMenu<HTMLElement>()
  const desktopLink = (page: PublicPage) => page === currentPage ? 'text-primary-dark' : 'transition hover:text-primary'
  const mobileLink = (page: PublicPage) => page === currentPage
    ? 'block rounded-lg bg-primary-light px-4 py-3 text-primary-dark'
    : 'block rounded-lg px-4 py-3 text-muted hover:bg-page hover:text-primary-dark'

  return (
    <header className="relative z-30 border-b border-line bg-white" ref={menuContainer}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
        <Link className="flex items-center gap-2 text-lg font-bold text-primary-dark sm:text-xl" to="/" aria-label="Ir al inicio de MediReservas">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-xl text-white" aria-hidden="true">+</span>
          <span className="hidden sm:inline">MediReservas</span>
        </Link>

        <ul className="hidden items-center gap-8 text-sm font-medium text-muted lg:flex">
          <li><Link className={desktopLink('home')} to="/" aria-current={currentPage === 'home' ? 'page' : undefined}>Inicio</Link></li>
          <li><Link className={desktopLink('directory')} to={`${medicalDirectoryHref}#especialidades`}>Especialidades</Link></li>
          <li><Link className={desktopLink('directory')} to={`${medicalDirectoryHref}#medicos`}>Médicos</Link></li>
          <li><Link className={desktopLink('contact')} to={contactHref} aria-current={currentPage === 'contact' ? 'page' : undefined}>Contacto</Link></li>
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <Link className="hidden rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark sm:inline-flex" to="/dashboard">Ir al panel</Link>
          ) : (
            <>
              <Link className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light sm:inline-flex" to="/login">Iniciar sesión</Link>
              <Link className="hidden rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark sm:inline-flex" to="/registro">Crear cuenta</Link>
            </>
          )}
          <button
            className="grid size-10 place-items-center rounded-lg border border-line text-primary-dark lg:hidden"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}
            onClick={toggleMenu}
          >
            <svg className="size-6" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      <nav id="mobile-menu" className={`${menuOpen ? '' : 'hidden'} absolute inset-x-0 top-full z-10 border-t border-line bg-white px-4 py-5 shadow-xl lg:hidden`} aria-label="Navegación móvil">
        <ul className="space-y-2 font-medium">
          <li><Link className={mobileLink('home')} to="/" aria-current={currentPage === 'home' ? 'page' : undefined} onClick={closeMenu}>Inicio</Link></li>
          <li><Link className={mobileLink('directory')} to={`${medicalDirectoryHref}#especialidades`} onClick={closeMenu}>Especialidades</Link></li>
          <li><Link className={mobileLink('directory')} to={`${medicalDirectoryHref}#medicos`} onClick={closeMenu}>Médicos</Link></li>
          <li><Link className={mobileLink('contact')} to={contactHref} aria-current={currentPage === 'contact' ? 'page' : undefined} onClick={closeMenu}>Contacto</Link></li>
        </ul>
        <div className={`mt-4 grid gap-3 border-t border-line pt-4 ${isAuthenticated ? '' : 'grid-cols-2'}`}>
          {isAuthenticated ? (
            <Link className="inline-flex justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white" to="/dashboard" onClick={closeMenu}>Ir al panel</Link>
          ) : (
            <>
              <Link className="inline-flex justify-center rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-primary-dark" to="/login" onClick={closeMenu}>Iniciar sesión</Link>
              <Link className="inline-flex justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white" to="/registro" onClick={closeMenu}>Crear cuenta</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default PublicHeader
