import type { AssistantTurn, Round } from '../conversation'
import { formatNumber, formatSeconds } from '../format'
import { SETUP_INFO } from '../setups'
import { turnStats, type TurnStats } from '../stats'
import type { SetupId } from '../types'
import { BestValue } from './BestValue'

interface ComparisonTableProps {
  round: Round
  setups: SetupId[]
}

function lowest(values: (number | undefined)[]): number | undefined {
  const known = values.filter((value) => value !== undefined)
  return known.length > 0 ? Math.min(...known) : undefined
}

/** What to show instead of the engine list, if anything. */
function engineStatus(turn: AssistantTurn, stats: TurnStats): string | undefined {
  if (turn.status === 'queued') return 'Queued'
  if (turn.status === 'error') return 'Failed'
  if (stats.engines.length === 0) return turn.status === 'streaming' ? 'Running…' : 'No searches'
  return undefined
}

function show(value: number | undefined, format: (value: number) => string): string {
  return value === undefined ? '—' : format(value)
}

const NUMBER_CELL = 'px-3 py-2 text-right font-mono tabular-nums'

/** One row per setup for the latest message, with the lowest search tokens and fastest time marked. */
export function ComparisonTable({ round, setups }: ComparisonTableProps) {
  const rows = setups.flatMap((setup) => {
    const turn = round.replies[setup]
    return turn ? [{ setup, turn, stats: turnStats(turn) }] : []
  })
  const finished = rows.filter(({ turn }) => turn.status === 'done')
  // Setups that didn't search have no search tokens to compare.
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
            <th scope="col" className="px-3 py-2 text-left font-bold">Setup</th>
            <th scope="col" className="px-3 py-2 text-left font-bold">Engines used</th>
            <th scope="col" className="px-3 py-2 text-right font-bold">Searches</th>
            <th scope="col" className="px-3 py-2 text-right font-bold">Search tokens</th>
            <th scope="col" className="px-3 py-2 text-right font-bold">Prompt tokens</th>
            <th scope="col" className="px-3 py-2 text-right font-bold">Completion tokens</th>
            <th scope="col" className="px-3 py-2 text-right font-bold">Total time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ setup, turn, stats }) => {
            const done = turn.status === 'done'
            // Searches stream in, so their counts are live while the setup runs.
            const hasCounts = done || turn.status === 'streaming'
            const searchTokens = !hasCounts
              ? '—'
              : stats.searchTokens === undefined
                ? 'n/a'
                : formatNumber(stats.searchTokens)
            const status = engineStatus(turn, stats)
            return (
              <tr key={setup} className="border-t border-neutral-200 align-top">
                <th scope="row" className="px-3 py-2 text-left font-bold whitespace-nowrap">
                  {SETUP_INFO[setup].name}
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
                    best={done && stats.searches > 0 && stats.searchTokens !== undefined && stats.searchTokens === leastSearchTokens}
                    label="lowest search tokens"
                  >
                    {searchTokens}
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
        Lowest search tokens among setups that searched, and fastest total time. Search tokens are n/a where the hosted
        search hides its payload.
      </p>
    </div>
  )
}
