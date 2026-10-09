import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { DASHBOARD_CONFIG, type DashboardAction } from '../../lib/roles'

interface DashboardSidebarProps {
  currentPath: string
  menuOpen: boolean
  onCloseMenu: () => void
}

function DashboardSidebar({ currentPath, menuOpen, onCloseMenu }: DashboardSidebarProps) {
  const { session } = useAuth()
  const config = session ? DASHBOARD_CONFIG[session.role] : null

  if (!config) return null

  const navigation: DashboardAction[] = [
    { icon: '⌂', title: 'Panel principal', href: '/dashboard', reactRoute: true, description: '' },
    { icon: 'MI', title: 'Mi perfil', href: '/perfil', reactRoute: true, description: '' },
    ...config.actions,
  ]

  return (
    <Fragment>
      <button
        className={`fixed inset-0 z-40 bg-slate-950/45 lg:hidden ${menuOpen ? '' : 'hidden'}`}
        type="button"
        aria-label="Cerrar menú de navegación"
        onClick={onCloseMenu}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-line bg-white px-5 py-5 shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:overflow-visible lg:px-5 lg:py-8 lg:shadow-none ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menú del panel"
      >
        <header className="mb-6 flex items-center justify-between gap-4 border-b border-line pb-5 lg:hidden">
          <p className="font-bold text-primary-dark">Menú principal</p>
          <button className="grid size-10 place-items-center rounded-xl border border-line text-xl text-muted" type="button" aria-label="Cerrar menú de navegación" onClick={onCloseMenu}>×</button>
        </header>
        <nav className="lg:sticky lg:top-8">
          <p className="mb-3 hidden px-3 text-xs font-bold uppercase tracking-widest text-muted lg:block">Navegación</p>
          <ul className="flex flex-col gap-2">
            {navigation.map((item) => {
              const current = item.href === currentPath
              const className = `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-primary-light hover:text-primary-dark ${current ? 'bg-primary-light text-primary-dark' : 'text-muted'}`
              const content = <><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-page text-xs font-bold text-primary-dark" aria-hidden="true">{item.icon}</span>{item.title}</>
              return (
                <li key={item.title}>
                  {item.reactRoute
                    ? <Link className={className} to={item.href} aria-current={current ? 'page' : undefined} onClick={onCloseMenu}>{content}</Link>
                    : <a className={className} href={item.href} onClick={onCloseMenu}>{content}</a>}
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </Fragment>
  )
}

export default DashboardSidebar
