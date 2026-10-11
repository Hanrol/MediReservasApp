import { Link } from 'react-router-dom'
import type { DashboardAction } from '../../constants/roles'

interface DashboardActionLinkProps {
  action: DashboardAction
  compact?: boolean
  current?: boolean
  onClick?: () => void
}

function DashboardActionLink({ action, compact = false, current = false, onClick }: DashboardActionLinkProps) {
  const className = compact
    ? `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-primary-light hover:text-primary-dark ${current ? 'bg-primary-light text-primary-dark' : 'text-muted'}`
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
    ? <Link className={className} to={action.href} aria-current={current ? 'page' : undefined} onClick={onClick}>{content}</Link>
    : <a className={className} href={action.href} onClick={onClick}>{content}</a>
}

export default DashboardActionLink
