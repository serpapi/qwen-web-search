import { formatNumber, formatSeconds } from '../format'
import type { Usage } from '../stats'

/** A compact row of counts, used under each Battleground turn and in column headers. */
export function UsageRow({ usage }: { usage: Usage }) {
  const show = (value: number | undefined, format: (value: number) => string = formatNumber) =>
    value === undefined ? 'n/a' : format(value)
  const items = [
    { label: 'Searches', value: show(usage.searches) },
    { label: 'Search tokens', value: show(usage.searchTokens) },
    { label: 'Prompt', value: show(usage.promptTokens) },
    { label: 'Completion', value: show(usage.completionTokens) },
    { label: 'Time', value: show(usage.totalSeconds, formatSeconds) },
  ]
  return (
    <dl className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
      {items.map(({ label, value }) => (
        <div key={label} className="flex gap-1">
          <dt className="text-neutral-600">{label}</dt>
          <dd className="font-mono font-bold tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
