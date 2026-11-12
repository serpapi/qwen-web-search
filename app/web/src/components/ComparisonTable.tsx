import type { AssistantTurn, Round } from '../conversation'
import { formatNumber, formatSeconds } from '../format'
import { turnStats, type TurnStats } from '../stats'
import { BestValue } from './BestValue'
import { ColumnLabel } from './ColumnLabel'

function lowest(values: (number | undefined)[]): number | undefined {
  const known = values.filter((value) => value !== undefined)
  return known.length > 0 ? Math.min(...known) : undefined
}

/** The row's state, shown under its engines (if any). Undefined for a finished row that searched. */
function rowStatus(turn: AssistantTurn, stats: TurnStats): string | undefined {
  if (turn.status === 'queued') return 'Queued'
  if (turn.status === 'skipped') return 'Not run'
  if (turn.status === 'stopped') return 'Stopped'
  if (turn.status === 'error') return 'Failed'
  if (turn.loadingModel) return 'Loading model…'
  if (stats.engines.length === 0) return turn.status === 'streaming' ? 'Running…' : 'No searches'
  return undefined
}

function show(value: number | undefined, format: (value: number) => string): string {
  return value === undefined ? '—' : format(value)
}

const NUMBER_CELL = 'px-3 py-1.5 text-right font-mono whitespace-nowrap tabular-nums'

/** One row per column for the latest message, with the lowest search tokens and fastest time marked. */
export function ComparisonTable({ round }: { round: Round }) {
  const rows = round.replies.map((turn) => ({ turn, stats: turnStats(turn) }))
  const finished = rows.filter(({ turn }) => turn.status === 'done')
  // Columns that didn't search have no search tokens to compare.
  const leastSearchTokens = lowest(finished.filter(({ stats }) => stats.searches > 0).map(({ stats }) => stats.searchTokens))
  const fastest = lowest(finished.map(({ stats }) => stats.totalSeconds))

  return (
    // relative keeps the sr-only text (absolutely positioned) inside this scroll area, so it can't make the page scroll.
    <div className="relative overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full min-w-[50rem] text-sm">
        <caption className="border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-left">
          <span className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span>
              <span className="font-bold">Latest question</span>
              <span className="ml-2 text-neutral-600">{round.question}</span>
            </span>
            <span className="ml-auto flex flex-col items-end gap-0.5 text-xs text-neutral-600">
              {/* The text, not the centered dot, sets the baseline, so Highlights lines up with Latest question. */}
              <span className="flex items-baseline gap-1.5">
                <span className="size-1.5 self-center rounded-full bg-brand-gradient" aria-hidden="true" />
                Highlights
              </span>
              <span>Prompt tokens include search tokens</span>
            </span>
          </span>
        </caption>
        <thead className="text-xs text-neutral-600">
          <tr>
            <th scope="col" className="px-3 py-1.5 text-left font-bold">Column</th>
            <th scope="col" className="px-3 py-1.5 text-left font-bold">Engines used</th>
            <th scope="col" className="px-3 py-1.5 text-right font-bold">Searches</th>
            <th scope="col" className="px-3 py-1.5 text-right font-bold">Search tokens</th>
            <th scope="col" className="px-3 py-1.5 text-right font-bold">Prompt tokens</th>
            <th scope="col" className="px-3 py-1.5 text-right font-bold">Completion tokens</th>
            <th scope="col" className="px-3 py-1.5 text-right font-bold">Total tokens</th>
            <th scope="col" className="px-3 py-1.5 text-right font-bold">Total time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ turn, stats }, index) => {
            const done = turn.status === 'done'
            // Searches stream in, so their counts are live while the column runs, and stay if it stops or fails.
            const started = turn.status !== 'queued' && turn.status !== 'skipped'
            const status = rowStatus(turn, stats)
            return (
              <tr key={index} className="border-t border-neutral-200 align-top">
                <th scope="row" className="px-3 py-1.5 text-left font-normal whitespace-nowrap">
                  <ColumnLabel position={index + 1} model={turn.model} setup={turn.setup} inline />
                </th>
                <td className="px-3 py-1.5">
                  {stats.engines.length > 0 && (
                    <ul className="flex flex-wrap gap-x-3">
                      {stats.engines.map(({ label, count }) => (
                        <li key={label}>
                          {label}
                          {count > 1 && <span className="ml-1.5 font-mono text-xs text-neutral-600">× {count}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                  {status && <p className="text-neutral-600">{status}</p>}
                </td>
                <td className={NUMBER_CELL}>{started ? formatNumber(stats.searches) : '—'}</td>
                <td className={NUMBER_CELL}>
                  <BestValue
                    best={done && stats.searches > 0 && stats.searchTokens === leastSearchTokens}
                    label="lowest search tokens"
                  >
                    {started ? formatNumber(stats.searchTokens) : '—'}
                  </BestValue>
                </td>
                <td className={NUMBER_CELL}>{show(stats.promptTokens, formatNumber)}</td>
                <td className={NUMBER_CELL}>{show(stats.completionTokens, formatNumber)}</td>
                <td className={NUMBER_CELL}>{show(stats.totalTokens, formatNumber)}</td>
                <td className={NUMBER_CELL}>
                  <BestValue best={stats.totalSeconds !== undefined && stats.totalSeconds === fastest} label="fastest">
                    {show(stats.totalSeconds, formatSeconds)}
                  </BestValue>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
