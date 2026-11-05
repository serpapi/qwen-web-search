import { Fragment, useState } from 'react'
import type { Exchange } from '../conversation'
import { useStickToBottom } from '../hooks/useStickToBottom'
import type { SetupId } from '../types'
import { AssistantMessage } from './AssistantMessage'
import { Composer } from './Composer'
import { EmptyState } from './EmptyState'
import { ExamplePrompts } from './ExamplePrompts'
import { SetupPicker } from './SetupPicker'
import { StatsPanel } from './StatsPanel'
import { UserMessage } from './UserMessage'

interface DedicatedViewProps {
  hidden: boolean
  setups: SetupId[]
  exchanges: Exchange[]
  /** True while any request is running, in either mode. */
  disabled: boolean
  onSend: (question: string, setup: SetupId) => void
}

export function DedicatedView({ hidden, setups, exchanges, disabled, onSend }: DedicatedViewProps) {
  const [setup, setSetup] = useState<SetupId>('serpapi-md')
  // The turn whose stats are shown. Null (or a cleared turn) means the latest one.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const scrollRef = useStickToBottom<HTMLDivElement>(exchanges)

  const found = exchanges.findIndex((exchange) => exchange.id === selectedId)
  const selectedIndex = found === -1 ? exchanges.length - 1 : found
  const selected = exchanges.at(selectedIndex)

  function send(question: string) {
    setSelectedId(null)
    onSend(question, setup)
  }

  return (
    <main
      hidden={hidden}
      className="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-[16rem_minmax(0,1fr)_19rem] lg:overflow-hidden xl:grid-cols-[18rem_minmax(0,1fr)_21rem]"
    >
      <aside
        aria-label="Search setup"
        className="border-b border-neutral-200 bg-neutral-50 p-4 lg:overflow-y-auto lg:border-r lg:border-b-0"
      >
        <SetupPicker setups={setups} value={setup} onChange={setSetup} />
      </aside>

      <section aria-label="Conversation" className="flex min-h-0 flex-col">
        <div ref={scrollRef} className="flex-1 lg:overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
            {exchanges.length === 0 ? (
              <EmptyState
                title="Ask Qwen something recent"
                description="Each answer shows the searches Qwen ran, which engine served them, and what they cost in tokens and time."
              >
                <ExamplePrompts onPick={send} disabled={disabled} />
              </EmptyState>
            ) : (
              exchanges.map((exchange) => (
                <Fragment key={exchange.id}>
                  <UserMessage text={exchange.question} />
                  <AssistantMessage
                    turn={exchange.reply}
                    selected={exchange === selected}
                    onSelect={() => setSelectedId(exchange.id)}
                  />
                </Fragment>
              ))
            )}
          </div>
        </div>
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-4 pt-3 pb-2 sm:px-6">
          <Composer
            onSend={send}
            disabled={disabled}
            placeholder={disabled ? 'Waiting for the current response…' : 'Ask anything'}
          />
        </div>
      </section>

      <aside
        aria-label="Turn stats"
        className="border-t border-neutral-200 bg-neutral-50 lg:overflow-y-auto lg:border-t-0 lg:border-l"
      >
        <StatsPanel exchange={selected} position={selectedIndex + 1} count={exchanges.length} />
      </aside>
    </main>
  )
}
