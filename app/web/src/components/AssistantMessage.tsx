import { ChartColumn } from 'lucide-react'
import type { AssistantTurn } from '../conversation'
import { SETUP_INFO } from '../setups'
import { ReplyContent } from './ReplyContent'
import { SetupTag } from './SetupTag'

interface AssistantMessageProps {
  turn: AssistantTurn
  selected: boolean
  onSelect: () => void
}

/** A Dedicated-mode reply. Clicking anywhere on it shows its stats. */
export function AssistantMessage({ turn, selected, onSelect }: AssistantMessageProps) {
  return (
    <article
      aria-label={`Answer from ${SETUP_INFO[turn.setup].name}`}
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border bg-white p-4 transition-colors ${
        selected ? 'border-brand-blue ring-1 ring-brand-blue' : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <SetupTag setup={turn.setup} />
        {/* Gives keyboard users a way to select; its click bubbles up to the article. */}
        <button
          type="button"
          aria-pressed={selected}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
            selected ? 'bg-brand-blue/10 text-brand-blue-text' : 'text-neutral-600 hover:bg-neutral-100 hover:text-ink'
          }`}
        >
          <ChartColumn className="size-3.5" aria-hidden="true" />
          Stats
        </button>
      </div>
      <ReplyContent turn={turn} />
    </article>
  )
}
