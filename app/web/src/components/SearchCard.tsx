import { ChevronDown, Search } from 'lucide-react'
import { useId, useState } from 'react'
import { formatCount, formatSeconds } from '../format'
import { toolName } from '../setups'
import type { SearchEvent, SetupId } from '../types'
import { PayloadViewer } from './PayloadViewer'
import { RecencyChip } from './RecencyChip'
import { SearchFailure } from './SearchFailure'

interface SearchCardProps {
  event: SearchEvent
  /** The turn's setup. Only the multi-engine one lets Qwen choose the engine. */
  setup: SetupId
  compact?: boolean
}

export function SearchCard({ event: { search, payload }, setup, compact = false }: SearchCardProps) {
  const [open, setOpen] = useState(false)
  const payloadId = useId()
  const failed = search.format === 'error'

  return (
    <div
      className={`rounded-lg border ${failed ? 'border-red-200 bg-red-50/60' : 'border-neutral-200 bg-neutral-50'} ${
        compact ? 'p-2.5 text-xs' : 'p-3 text-sm'
      }`}
    >
      <div className="flex items-start gap-2">
        <Search className="mt-0.5 size-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
        <p className="min-w-0 flex-1 font-bold wrap-anywhere">
          <span className="sr-only">Search query: </span>
          {search.query}
        </p>
        {failed && (
          <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-bold text-red-800">Failed</span>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-5.5">
        <p>
          {setup === 'serpapi' && <span className="text-neutral-600">Qwen chose </span>}
          {toolName(search.tool)}
        </p>
        {/* Only Google applies a time range; the other engines ignore it. */}
        {search.recency && search.engine === 'google' && <RecencyChip recency={search.recency} />}
      </div>

      {failed ? (
        <SearchFailure payload={payload} />
      ) : (
        <>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pl-5.5">
            <span className="font-mono text-neutral-600 tabular-nums">
              {formatCount(search.tokens, 'token')} · {formatSeconds(search.seconds)}
            </span>
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
          </div>
          <PayloadViewer id={payloadId} hidden={!open} payload={payload} />
        </>
      )}
    </div>
  )
}
