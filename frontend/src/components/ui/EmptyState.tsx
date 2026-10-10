import type { ReactNode } from 'react'

interface EmptyStateProps {
  children: ReactNode
  className?: string
}

function EmptyState({ children, className = '' }: EmptyStateProps) {
  return (
    <div className={`mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 ${className}`} role="status">
      {children}
    </div>
  )
}

export default EmptyState
