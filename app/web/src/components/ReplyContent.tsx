import { CircleDashed, CircleStop, Clock } from 'lucide-react'
import { memo } from 'react'
import type { AssistantTurn } from '../conversation'
import { Answer } from './Answer'
import { ErrorNotice } from './ErrorNotice'
import { SearchCard } from './SearchCard'
import { StatusLine } from './StatusLine'
import { ThinkingIndicator } from './ThinkingIndicator'

interface ReplyContentProps {
  turn: AssistantTurn
  compact?: boolean
}

function activityLabel(turn: AssistantTurn): string {
  if (turn.loadingModel) return `Loading ${turn.loadingModel}`
  if (turn.activity === 'searching') return 'Searching'
  if (turn.activity === 'writing') return 'Writing the answer'
  return 'Thinking'
}

/**
 * A reply in arrival order: status, then each search as it lands, then the answer as it streams, and how it ended.
 * Memoized, so while one reply streams, the finished replies around it don't render their Markdown again.
 */
export const ReplyContent = memo(function ReplyContent({ turn, compact = false }: ReplyContentProps) {
  // A stopped or failed turn keeps the text that streamed before it ended.
  const answer = turn.result?.answer ?? turn.draft

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {turn.status === 'queued' && <StatusLine icon={Clock} label="Queued" />}
      {turn.status === 'skipped' && <StatusLine icon={CircleDashed} label="Not run" />}
      {turn.status === 'streaming' && turn.startedAt !== undefined && (
        <ThinkingIndicator label={activityLabel(turn)} startedAt={turn.startedAt} />
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
      {answer.trim() !== '' && <Answer text={answer} compact={compact} />}
      {turn.status === 'stopped' && <StatusLine icon={CircleStop} label="Stopped" />}
      {turn.error && <ErrorNotice message={turn.error} />}
    </div>
  )
})
