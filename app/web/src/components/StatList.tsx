export interface StatItem {
  label: string
  value: string
  /** A background class for a legend swatch. */
  swatch?: string
}

export function StatList({ items }: { items: StatItem[] }) {
  return (
    <dl className="space-y-1.5 text-sm">
      {items.map(({ label, value, swatch }) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-neutral-600">
            {swatch && <span className={`size-2.5 rounded-sm ${swatch}`} aria-hidden="true" />}
            {label}
          </dt>
          <dd className="font-mono tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
