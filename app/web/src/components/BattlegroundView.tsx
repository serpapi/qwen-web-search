import { useState } from 'react'
import type { Round } from '../conversation'
import { formatCount } from '../format'
import { SETUP_IDS, SETUP_INFO } from '../setups'
import type { SetupId } from '../types'
import { BattleColumn } from './BattleColumn'
import { ComparisonTable } from './ComparisonTable'
import { Composer } from './Composer'
import { EmptyState } from './EmptyState'
import { ExamplePrompts } from './ExamplePrompts'
import { SetupChips } from './SetupChips'

interface BattlegroundViewProps {
  hidden: boolean
  setups: SetupId[]
  rounds: Round[]
  /** True while this mode's setups are running. */
  running: boolean
  /** True while any request is running, in either mode. */
  disabled: boolean
  onSend: (question: string, setups: SetupId[]) => void
}

/** "Running SerpApi · JSON (3 of 3)" for the setup currently streaming. */
function progress(round: Round, setups: SetupId[]): string | undefined {
  const order = setups.filter((setup) => round.replies[setup])
  const index = order.findIndex((setup) => round.replies[setup]?.status === 'streaming')
  if (index === -1) return undefined
  return `Running ${SETUP_INFO[order[index]].name} (${index + 1} of ${order.length})`
}

export function BattlegroundView({ hidden, setups, rounds, running, disabled, onSend }: BattlegroundViewProps) {
  const [selected, setSelected] = useState<SetupId[]>(SETUP_IDS)
  const participants = setups.filter((setup) => selected.includes(setup))
  const latest = rounds.at(-1)
  const status = latest && progress(latest, setups)
  const audience = formatCount(participants.length, 'selected setup')

  function send(question: string) {
    onSend(question, participants)
  }

  return (
    <main hidden={hidden} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-neutral-200 px-4 py-3 sm:px-6">
          <SetupChips setups={setups} selected={selected} onChange={setSelected} disabled={running} />
          <p aria-live="polite" className="ml-auto text-sm text-neutral-600">
            {status ?? 'Setups run one after another, so they never compete for the local model.'}
          </p>
        </div>

        {latest ? (
          <div className="space-y-4 p-4 sm:px-6">
            <ComparisonTable round={latest} setups={setups} />
            <div className="overflow-x-auto pb-1">
              <div className="grid auto-cols-[minmax(20rem,1fr)] grid-flow-col items-start gap-3">
                {participants.map((setup) => (
                  <BattleColumn key={setup} setup={setup} rounds={rounds} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 sm:px-6">
            <EmptyState
              title="Compare search setups side by side"
              description={`Each message goes to the ${audience}, one after another. Every setup keeps its own conversation, so follow-up questions work in each column.`}
            >
              <ExamplePrompts onPick={send} disabled={disabled} />
            </EmptyState>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 bg-white px-4 pt-3 pb-2 sm:px-6">
        <Composer
          onSend={send}
          disabled={disabled}
          placeholder={disabled ? 'Waiting for the current response…' : `Ask the ${audience}`}
        />
      </div>
    </main>
  )
}
