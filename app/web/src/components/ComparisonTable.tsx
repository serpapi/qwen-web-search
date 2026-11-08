import type { AssistantTurn, Round } from '../conversation'
import { formatNumber, formatSeconds } from '../format'
import { turnStats, type TurnStats } from '../stats'
import { BestValue } from './BestValue'
import { ColumnLabel } from './ColumnLabel'

function lowest(values: (number | undefined)[]): number | undefined {
  const known = values.filter((value) => value !== undefined)
  return known.length > 0 ? Math.min(...known) : undefined
}

/** What to show instead of the engine list, if anything. */
function engineStatus(turn: AssistantTurn, stats: TurnStats): string | undefined {
  if (turn.status === 'queued') return 'Queued'
  if (turn.status === 'error') return 'Failed'
  if (turn.loadingModel) return 'Loading model…'
  if (stats.engines.length === 0) return turn.status === 'streaming' ? 'Running…' : 'No searches'
  return undefined
}

function show(value: number | undefined, format: (value: number) => string): string {
  return value === undefined ? '—' : format(value)
}

const NUMBER_CELL = 'px-3 py-2 text-right font-mono tabular-nums'

/** One row per column for the latest message, with the lowest search tokens and fastest time marked. */
export function ComparisonTable({ round }: { round: Round }) {
  const rows = round.replies.map((turn) => ({ turn, stats: turnStats(turn) }))
  const finished = rows.filter(({ turn }) => turn.status === 'done')
  // Columns that didn't search have no search tokens to compare.
  const leastSearchTokens = lowest(finished.filter(({ stats }) => stats.searches > 0).map(({ stats }) => stats.searchTokens))
  const fastest = lowest(finished.map(({ stats }) => stats.totalSeconds))

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full min-w-[44rem] text-sm">
        <caption className="border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-left">
          <span className="font-bold">Latest turn</span>
          <span className="ml-2 text-neutral-600">{round.question}</span>
        </caption>
        <thead className="text-xs text-neutral-600">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-bold">Column</th>
            <th scope="col" className="px-3 py-2 text-left font-bold">Engines used</th>
            <th scope="col" className="px-3 py-2 text-right font-bold">Searches</th>
            <th scope="col" className="px-3 py-2 text-right font-bold">Search tokens</th>
            <th scope="col" className="px-3 py-2 text-right font-bold">Prompt tokens</th>
            <th scope="col" className="px-3 py-2 text-right font-bold">Completion tokens</th>
            <th scope="col" className="px-3 py-2 text-right font-bold">Total time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ turn, stats }, index) => {
            const done = turn.status === 'done'
            // Searches stream in, so their counts are live while the column runs.
            const hasCounts = done || turn.status === 'streaming'
            const status = engineStatus(turn, stats)
            return (
              <tr key={index} className="border-t border-neutral-200 align-top">
                <th scope="row" className="px-3 py-2 text-left font-normal whitespace-nowrap">
                  <ColumnLabel position={index + 1} model={turn.model} setup={turn.setup} />
                </th>
                <td className="px-3 py-2">
                  {status ? (
                    <span className="text-neutral-600">{status}</span>
                  ) : (
                    <ul>
                      {stats.engines.map(({ label, count }) => (
                        <li key={label}>
                          {label}
                          {count > 1 && <span className="ml-1.5 font-mono text-xs text-neutral-600">× {count}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className={NUMBER_CELL}>{hasCounts ? formatNumber(stats.searches) : '—'}</td>
                <td className={NUMBER_CELL}>
                  <BestValue
                    best={done && stats.searches > 0 && stats.searchTokens === leastSearchTokens}
                    label="lowest search tokens"
                  >
                    {hasCounts ? formatNumber(stats.searchTokens) : '—'}
                  </BestValue>
                </td>
                <td className={NUMBER_CELL}>{show(stats.promptTokens, formatNumber)}</td>
                <td className={NUMBER_CELL}>{show(stats.completionTokens, formatNumber)}</td>
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
      <p className="flex items-center gap-1.5 border-t border-neutral-200 px-3 py-1.5 text-xs text-neutral-600">
        <span className="size-1.5 rounded-full bg-brand-gradient" aria-hidden="true" />
        Lowest search tokens among columns that searched, and fastest total time.
      </p>
    </div>
  )
}
