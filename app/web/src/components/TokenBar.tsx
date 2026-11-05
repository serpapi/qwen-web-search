import { formatNumber } from '../format'

interface Segment {
  label: string
  value: number
  /** A background class. */
  color: string
}

/** A horizontal stacked bar; each segment's width is its share of the total. */
export function TokenBar({ segments }: { segments: Segment[] }) {
  const visible = segments.filter((segment) => segment.value > 0)
  return (
    <div
      role="img"
      aria-label={segments.map((segment) => `${segment.label}: ${formatNumber(segment.value)} tokens`).join(', ')}
      className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-neutral-200"
    >
      {visible.map((segment) => (
        <div key={segment.label} className={`min-w-1 basis-0 ${segment.color}`} style={{ flexGrow: segment.value }} />
      ))}
    </div>
  )
}
