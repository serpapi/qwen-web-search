import type { AssistantTurn } from './conversation'
import { servedBy } from './setups'

/** Counts for one turn or several. A value is undefined until it is known. */
export interface Usage {
  searches: number
  searchTokens: number
  promptTokens?: number
  completionTokens?: number
  totalSeconds?: number
}

export interface TurnStats extends Usage {
  searchSeconds: number
  modelSeconds?: number
  engines: { label: string; count: number }[]
}

/** Sums the values, or returns undefined if any is missing. */
function sumIfAll(values: (number | undefined)[]): number | undefined {
  let total = 0
  for (const value of values) {
    if (value === undefined) return undefined
    total += value
  }
  return total
}

export function turnStats(turn: AssistantTurn): TurnStats {
  const steps = turn.searches.map((event) => event.search)
  const searchSeconds = steps.reduce((total, step) => total + step.seconds, 0)
  const result = turn.result

  const engines = new Map<string, number>()
  for (const step of steps) {
    const label = servedBy(step)
    engines.set(label, (engines.get(label) ?? 0) + 1)
  }

  return {
    searches: steps.length,
    searchTokens: steps.reduce((total, step) => total + step.tokens, 0),
    promptTokens: result?.prompt_tokens,
    completionTokens: result?.completion_tokens,
    totalSeconds: result?.total_seconds,
    searchSeconds,
    modelSeconds: result ? Math.max(0, result.total_seconds - searchSeconds) : undefined,
    engines: [...engines].map(([label, count]) => ({ label, count })),
  }
}

/** Running totals over the finished turns, or undefined if none has finished. */
export function totalUsage(turns: AssistantTurn[]): Usage | undefined {
  const finished = turns.filter((turn) => turn.status === 'done').map(turnStats)
  if (finished.length === 0) return undefined
  const sum = (pick: (stats: TurnStats) => number | undefined) => sumIfAll(finished.map(pick))
  return {
    searches: finished.reduce((total, stats) => total + stats.searches, 0),
    searchTokens: finished.reduce((total, stats) => total + stats.searchTokens, 0),
    promptTokens: sum((stats) => stats.promptTokens),
    completionTokens: sum((stats) => stats.completionTokens),
    totalSeconds: sum((stats) => stats.totalSeconds),
  }
}
