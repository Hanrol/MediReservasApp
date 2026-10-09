import { type ReactNode, useEffect, useState } from 'react'
import DashboardHeader from './DashboardHeader'
import DashboardSidebar from './DashboardSidebar'

interface DashboardLayoutProps {
  children: ReactNode
  currentPath: string
  mainClassName?: string
}

function DashboardLayout({ children, currentPath, mainClassName = 'px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12' }: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', menuOpen)
    return () => document.body.classList.remove('overflow-hidden')
  }, [menuOpen])

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased">
      <a className="fixed left-4 top-4 z-60 -translate-y-24 rounded-lg bg-white px-4 py-2 font-semibold text-primary-dark shadow-xl transition focus:translate-y-0" href="#main-content">Saltar al contenido principal</a>
      <DashboardHeader menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />
      <div className="grid w-full flex-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <DashboardSidebar currentPath={currentPath} menuOpen={menuOpen} onCloseMenu={() => setMenuOpen(false)} />
        <main className={`min-w-0 ${mainClassName}`} id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <footer className="border-t border-line bg-white px-4 py-5 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} MediReservas. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default DashboardLayout
