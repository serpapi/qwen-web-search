import { ChevronDown, Search } from 'lucide-react'
import { useId, useState } from 'react'
import { formatCount, formatSeconds } from '../format'
import { servedBy, toolName } from '../setups'
import type { SearchEvent, SetupId } from '../types'
import { FormatBadge } from './FormatBadge'
import { PayloadViewer } from './PayloadViewer'

interface SearchCardProps {
  event: SearchEvent
  setup: SetupId
  compact?: boolean
}

export function SearchCard({ event: { search, payload }, setup, compact = false }: SearchCardProps) {
  const [open, setOpen] = useState(false)
  const payloadId = useId()
  const cost: string[] = []
  if (search.tokens !== undefined) cost.push(formatCount(search.tokens, 'token'))
  if (search.seconds !== undefined) cost.push(formatSeconds(search.seconds))

  return (
    <div className={`rounded-lg border border-neutral-200 bg-neutral-50 ${compact ? 'p-2.5 text-xs' : 'p-3 text-sm'}`}>
      <div className="flex items-start gap-2">
        <Search className="mt-0.5 size-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
        <p className="min-w-0 flex-1 font-bold wrap-anywhere">
          <span className="sr-only">Search query: </span>
          {search.query}
        </p>
        <FormatBadge format={search.format} />
      </div>

      <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 pl-5.5">
        <dt className="text-neutral-600">Qwen chose</dt>
        <dd>{toolName(search.tool)}</dd>
        <dt className="text-neutral-600">Served by</dt>
        <dd>{servedBy(search, setup)}</dd>
      </dl>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pl-5.5">
        {cost.length > 0 && <span className="font-mono text-neutral-600 tabular-nums">{cost.join(' · ')}</span>}
        {payload === undefined ? (
          <span className="text-neutral-600">Payload isn't exposed by the hosted search</span>
        ) : (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={payloadId}
            onClick={() => setOpen(!open)}
            className="ml-auto inline-flex items-center gap-1 font-bold text-brand-blue-text hover:underline"
          >
            {open ? 'Hide payload' : 'View payload'}
            <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {payload !== undefined && <PayloadViewer id={payloadId} hidden={!open} payload={payload} step={search} />}
    </div>
  )
}
