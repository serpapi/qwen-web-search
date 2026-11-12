export interface StatItem {
  label: string
  value: string
  /** A background class for a legend dot. */
  swatch?: string
  /** Marks the row as the sum of the rows above it: bold, under a rule. */
  sum?: boolean
}

export function StatList({ items }: { items: StatItem[] }) {
  return (
    <dl className="space-y-1.5 text-sm">
      {items.map(({ label, value, swatch, sum }) => (
        <div
          key={label}
          className={`flex items-center justify-between gap-3 ${sum ? 'border-t border-neutral-200 pt-1.5 font-bold' : ''}`}
        >
          <dt className={`flex items-center gap-2 ${sum ? '' : 'text-neutral-600'}`}>
            {swatch && <span className={`size-2.5 shrink-0 rounded-full ${swatch}`} aria-hidden="true" />}
            {label}
          </dt>
          <dd className="font-mono tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
