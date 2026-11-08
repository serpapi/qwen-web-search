import { Clock } from 'lucide-react'
import type { AssistantTurn } from '../conversation'
import { Answer } from './Answer'
import { ErrorNotice } from './ErrorNotice'
import { SearchCard } from './SearchCard'
import { ThinkingIndicator } from './ThinkingIndicator'

interface ReplyContentProps {
  turn: AssistantTurn
  compact?: boolean
}

/** A reply in arrival order: status, then each search as it lands, then the answer. */
export function ReplyContent({ turn, compact = false }: ReplyContentProps) {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {turn.status === 'queued' && (
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <Clock className="size-4" aria-hidden="true" />
          Queued
        </p>
      )}
      {turn.status === 'streaming' && turn.startedAt !== undefined && (
        <ThinkingIndicator
          label={turn.loadingModel ? `Loading ${turn.loadingModel}` : 'Thinking'}
          startedAt={turn.startedAt}
        />
      )}
      {turn.searches.length > 0 && (
        <ol aria-label="Searches" className="space-y-2">
          {turn.searches.map((event, index) => (
            <li key={index}>
              <SearchCard event={event} compact={compact} />
            </li>
          ))}
        </ol>
      )}
      {turn.result && <Answer text={turn.result.answer} compact={compact} />}
      {turn.error && <ErrorNotice message={turn.error} />}
    </div>
  )
}
