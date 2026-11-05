import type { Round } from '../conversation'
import { SETUP_INFO } from '../setups'
import { totalUsage, turnStats } from '../stats'
import type { SetupId } from '../types'
import { ReplyContent } from './ReplyContent'
import { UsageRow } from './UsageRow'
import { UserMessage } from './UserMessage'

interface BattleColumnProps {
  setup: SetupId
  rounds: Round[]
}

/** One setup's own conversation: the rounds it took part in. */
export function BattleColumn({ setup, rounds }: BattleColumnProps) {
  const turns = rounds.flatMap((round) => {
    const reply = round.replies[setup]
    return reply ? [{ round, reply }] : []
  })
  const totals = totalUsage(turns.map(({ reply }) => reply))

  return (
    <section aria-label={SETUP_INFO[setup].name} className="flex flex-col rounded-xl border border-neutral-200 bg-white">
      <header className="space-y-1 rounded-t-xl border-b border-neutral-200 bg-neutral-50 px-3 py-2.5">
        <h2 className="flex items-center gap-2 font-bold">
          <span className="size-2 rounded-full bg-brand-gradient" aria-hidden="true" />
          {SETUP_INFO[setup].name}
        </h2>
        {totals ? (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-xs font-bold text-neutral-600">Totals</span>
            <UsageRow usage={totals} />
          </div>
        ) : (
          <p className="text-xs text-neutral-600">No finished turns yet</p>
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
