import { CalendarClock } from 'lucide-react'

const LABELS: Record<string, string> = {
  day: 'Past day',
  week: 'Past week',
  month: 'Past month',
  year: 'Past year',
}

/** The time range Qwen limited a Google search to. Ollama doesn't enforce the enum, so other values show as they are. */
export function RecencyChip({ recency }: { recency: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-neutral-700 ring-1 ring-neutral-200">
      <CalendarClock className="size-3" aria-hidden="true" />
      <span className="sr-only">Time range: </span>
      {LABELS[recency] ?? `Past ${recency}`}
    </span>
  )
}
