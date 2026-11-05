import type { ReactNode } from 'react'

interface BestValueProps {
  best: boolean
  /** Read by screen readers after a best value, such as "fastest". */
  label: string
  children: ReactNode
}

/** A comparison value, marked when it is the best in its column. */
export function BestValue({ best, label, children }: BestValueProps) {
  if (!best) return children
  return (
    <span className="inline-flex items-center gap-1.5 font-bold text-brand-blue-text">
      <span className="size-1.5 rounded-full bg-brand-gradient" aria-hidden="true" />
      {children}
      <span className="sr-only"> ({label})</span>
    </span>
  )
}
