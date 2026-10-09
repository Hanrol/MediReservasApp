import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-6 overflow-x-auto text-sm" aria-label="Ruta de navegación">
      <ol className="flex min-w-max items-center gap-2 text-muted">
        {items.map((item, index) => {
          const current = index === items.length - 1
          return (
            <li className="contents" key={`${item.label}-${index}`}>
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href && !current ? (
                <Link className="font-semibold text-primary-dark transition hover:underline" to={item.href}>{item.label}</Link>
              ) : (
                <span className="font-semibold text-ink" aria-current={current ? 'page' : undefined}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
