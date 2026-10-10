import type { ReactNode } from 'react'

interface SummaryCardProps {
  value: ReactNode
  label: string
}

function SummaryCard({ value, label }: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <p className="text-3xl font-bold text-primary-dark">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </article>
  )
}

export default SummaryCard
