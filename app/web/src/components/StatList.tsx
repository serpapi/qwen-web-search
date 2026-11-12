export interface StatItem {
  label: string
  value: string
  /** A background class for a legend swatch. */
  swatch?: string
  /** Indented under the item before it, as a part of it. */
  nested?: boolean
}

export function StatList({ items }: { items: StatItem[] }) {
  return (
    <dl className="space-y-1.5 text-sm">
      {items.map(({ label, value, swatch, nested = false }) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <dt className={`flex items-center gap-2 text-neutral-600 ${nested ? 'pl-4.5' : ''}`}>
            {swatch && <span className={`size-2.5 shrink-0 rounded-sm ${swatch}`} aria-hidden="true" />}
            {label}
          </dt>
          <dd className="font-mono tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
