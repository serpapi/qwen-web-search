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
  /** True while the latest reply is running. */
  running: boolean
  /** Why sending is disabled, such as Battleground mode answering. Undefined when sending is allowed. */
  disabledReason: string | undefined
  onSend: (question: string, setup: SetupId) => void
  onStop: () => void
}

export function DedicatedView({ hidden, setups, exchanges, running, disabledReason, onSend, onStop }: DedicatedViewProps) {
  const disabled = disabledReason !== undefined
  const [setup, setSetup] = useState<SetupId>('serpapi')
  // The turn whose stats are shown. Null (or a cleared turn) means the latest one.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const endRef = useStickToBottom<HTMLDivElement>(exchanges)

  const found = exchanges.findIndex((exchange) => exchange.id === selectedId)
  const selectedIndex = found === -1 ? exchanges.length - 1 : found
  const selected = exchanges.at(selectedIndex)
  // The stats panel appears with the first message, so the layout changes once, when the user sends, rather than when
  // the answer arrives. Until then the conversation takes its width.
  const columns = selected
    ? 'lg:grid-cols-[16rem_minmax(0,1fr)_19rem] xl:grid-cols-[18rem_minmax(0,1fr)_21rem]'
    : 'lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]'

  function send(question: string) {
    setSelectedId(null)
    onSend(question, setup)
  }

  return (
    // Every scroll area is relative: the whole view on narrow screens, and each panel on wide ones. That way the sr-only
    // text inside (absolutely positioned) is laid out and clipped there. Otherwise it escapes to the page, and the page
    // scrolls past the composer.
    <main
      hidden={hidden}
      className={`relative min-h-0 flex-1 overflow-y-auto lg:grid lg:overflow-hidden ${columns}`}
    >
      <aside
        aria-label="Web search"
        className="relative border-b border-neutral-200 bg-neutral-50 p-4 lg:overflow-y-auto lg:border-r lg:border-b-0"
      >
        <SetupPicker setups={setups} value={setup} onChange={setSetup} />
      </aside>

      <section aria-label="Conversation" className="flex min-h-0 flex-col">
        <div className="relative flex-1 lg:overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
            {exchanges.length === 0 ? (
              <EmptyState
                title="Ask Qwen"
                description="Watch its reasoning, searches, engine choices, and per-response stats."
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
          {/* The scroll margin leaves room for the composer, which sticks over the bottom of the view on narrow screens. */}
          <div ref={endRef} aria-hidden="true" className="h-px scroll-mb-28" />
        </div>
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-4 pt-3 pb-2 sm:px-6">
          <Composer
            onSend={send}
            onStop={onStop}
            pendingQuestion={running ? exchanges.at(-1)?.question : undefined}
            disabled={disabled}
            placeholder={disabledReason ?? 'Ask anything'}
          />
        </div>
      </section>

      {selected && (
        <aside
          aria-label="Answer stats"
          className="relative border-t border-neutral-200 bg-neutral-50 lg:overflow-y-auto lg:border-t-0 lg:border-l"
        >
          <StatsPanel exchange={selected} position={selectedIndex + 1} count={exchanges.length} />
        </aside>
      )}
    </main>
  )
}
