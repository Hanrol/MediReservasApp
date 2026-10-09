import { Link } from 'react-router-dom'

interface PublicFooterProps {
  compact?: boolean
  medicalDirectoryHref?: string
  contactHref?: string
}

function PublicFooter({
  compact = false,
  medicalDirectoryHref = '/medicos-especialidades',
  contactHref = '/contacto',
}: PublicFooterProps) {
  const year = new Date().getFullYear()

  if (compact) {
    return (
      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-bold text-primary-dark">MediReservas</p>
          <p>© {year} MediReservas. Todos los derechos reservados.</p>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 md:items-center lg:px-8">
        <div>
          <Link className="text-lg font-bold text-primary-dark" to="/">MediReservas</Link>
          <p className="mt-2 text-sm text-muted">Una forma simple de organizar tu atención médica.</p>
        </div>
        <nav aria-label="Navegación del pie de página">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted md:justify-center">
            <li><Link className="hover:text-primary" to="/">Inicio</Link></li>
            <li><a className="hover:text-primary" href={`${medicalDirectoryHref}#medicos`}>Médicos</a></li>
            <li><a className="hover:text-primary" href={`${medicalDirectoryHref}#especialidades`}>Especialidades</a></li>
            <li><a className="hover:text-primary" href={contactHref}>Contacto</a></li>
          </ul>
        </nav>
        <p className="text-sm text-muted md:text-right">© {year} MediReservas. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default PublicFooter
