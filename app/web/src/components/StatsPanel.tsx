import type { Exchange } from '../conversation'
import { formatNumber, formatSeconds } from '../format'
import { turnStats } from '../stats'
import { SetupTag } from './SetupTag'
import { StatList } from './StatList'
import { TokenBar } from './TokenBar'

interface StatsPanelProps {
  exchange: Exchange | undefined
  /** 1-based position of the exchange in the conversation. */
  position: number
  count: number
}

const SECTION_TITLE = 'mb-2 text-xs font-bold text-neutral-600'
const SUBSECTION_TITLE = 'mt-3 mb-1.5 text-xs text-neutral-600'

/** A value, or a dash until the answer brings it. Stopped and failed turns never get one. */
function show(value: number | undefined, format: (value: number) => string = formatNumber) {
  return value === undefined ? '—' : format(value)
}

export function StatsPanel({ exchange, position, count }: StatsPanelProps) {
  if (!exchange) {
    return (
      <div className="p-4">
        <h2 className="font-bold">Turn stats</h2>
        <p className="mt-1 text-sm text-neutral-600">Send a message to see what each answer costs in tokens and time.</p>
      </div>
    )
  }

  const { reply } = exchange
  const stats = turnStats(reply)

  return (
    <div className="space-y-6 p-4">
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-bold">Turn stats</h2>
          <span className="text-xs text-neutral-600">
            {position === count ? 'Latest turn' : `Turn ${position} of ${count}`}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{exchange.question}</p>
      </div>

      <section>
        <h3 className={SECTION_TITLE}>Setup</h3>
        <SetupTag setup={reply.setup} />
        <h4 className={SUBSECTION_TITLE}>Model</h4>
        <p className="font-mono text-sm wrap-anywhere">{reply.model}</p>
        <h4 className={SUBSECTION_TITLE}>Engines used</h4>
        {stats.engines.length === 0 ? (
          <p className="text-sm">{reply.status === 'streaming' ? 'None yet' : 'No searches'}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {stats.engines.map(({ label, count: uses }) => (
              <li key={label} className="flex justify-between gap-3">
                <span className="min-w-0 wrap-anywhere">{label}</span>
                {uses > 1 && <span className="font-mono text-neutral-600 tabular-nums">× {uses}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {reply.status === 'error' ? (
        <p className="text-sm text-neutral-600">This request failed, so it has no token or time stats.</p>
      ) : (
        <>
          <section>
            <h3 className={SECTION_TITLE}>Tokens</h3>
            <div className="space-y-3">
              {/* Drawn once the answer brings the prompt and completion counts. */}
              {reply.result && (
                <TokenBar
                  prompt={reply.result.prompt_tokens}
                  searchPayload={stats.searchTokens}
                  completion={reply.result.completion_tokens}
                />
              )}
              <StatList
                items={[
                  { label: 'Prompt', value: show(stats.promptTokens), swatch: 'bg-brand-blue' },
                  { label: 'Search (included in prompt)', value: formatNumber(stats.searchTokens), swatch: 'bg-ink' },                  
                  { label: 'Completion', value: show(stats.completionTokens), swatch: 'bg-brand-purple' },
                  { label: 'Total', value: show(stats.totalTokens), sum: true },
                ]}
              />
            </div>
          </section>

          <section>
            <h3 className={SECTION_TITLE}>Time</h3>
            <StatList
              items={[
                { label: 'Total', value: show(stats.totalSeconds, formatSeconds) },
                { label: 'Search', value: formatSeconds(stats.searchSeconds) },
                { label: 'Model', value: show(stats.modelSeconds, formatSeconds) },
              ]}
            />
          </section>

          <section>
            <h3 className={SECTION_TITLE}>Searches</h3>
            <StatList items={[{ label: 'Searches run', value: formatNumber(stats.searches) }]} />
          </section>

          <p className="rounded-lg border border-neutral-200 bg-white p-3 text-xs leading-relaxed text-neutral-600">
            Prompt tokens are cumulative across tool rounds. Each round resends the system prompt, the tool definitions and
            the conversation so far, including earlier search results.
          </p>
        </>
      )}
    </div>
  )
}
