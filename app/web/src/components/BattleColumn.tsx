import { columnLabel, type Column } from '../columns'
import type { Round } from '../conversation'
import { totalUsage, turnStats } from '../stats'
import { ColumnLabel } from './ColumnLabel'
import { ReplyContent } from './ReplyContent'
import { UsageRow } from './UsageRow'
import { UserMessage } from './UserMessage'

interface BattleColumnProps {
  column: Column
  /** The column's position. Its reply in every round is at this index. */
  index: number
  rounds: Round[]
}

/** One column's own conversation. */
export function BattleColumn({ column, index, rounds }: BattleColumnProps) {
  const turns = rounds.map((round) => ({ round, reply: round.replies[index] }))
  const replies = turns.map(({ reply }) => reply)
  // With one finished turn, its numbers are already under it and in the comparison table.
  const totals = replies.filter((reply) => reply.status === 'done').length >= 2 ? totalUsage(replies) : undefined

  return (
    <section
      aria-label={`Column ${index + 1}: ${columnLabel(column)}`}
      className="flex flex-col rounded-xl border border-neutral-200 bg-white"
    >
      <header className="space-y-2 rounded-t-xl border-b border-neutral-200 bg-neutral-50 px-3 py-2.5">
        <h2>
          <ColumnLabel position={index + 1} model={column.model} setup={column.setup} />
        </h2>
        {totals && (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-xs font-bold text-neutral-600">Totals</span>
            <UsageRow usage={totals} />
          </div>
        )}
      </header>
      <ol className="space-y-5 p-3">
        {turns.map(({ round, reply }) => (
          <li key={round.id} className="space-y-2.5">
            <UserMessage text={round.question} compact />
            <ReplyContent turn={reply} compact />
            {reply.result && (
              <div className="border-t border-neutral-200 pt-2">
                <UsageRow usage={turnStats(reply)} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
