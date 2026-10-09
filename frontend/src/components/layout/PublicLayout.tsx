import type { ReactNode } from 'react'
import SkipLink from '../ui/SkipLink'
import PublicFooter from './PublicFooter'
import PublicHeader, { type PublicPage } from './PublicHeader'

interface PublicLayoutProps {
  children: ReactNode
  currentPage: PublicPage
  compactFooter?: boolean
}

function PublicLayout({ children, currentPage, compactFooter = false }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-page text-ink antialiased">
      <SkipLink />
      <PublicHeader currentPage={currentPage} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <PublicFooter compact={compactFooter} />
    </div>
  )
}

export default PublicLayout
