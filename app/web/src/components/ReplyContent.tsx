import { CircleDashed, CircleStop, Clock } from 'lucide-react'
import { memo } from 'react'
import type { AssistantTurn } from '../conversation'
import { Answer } from './Answer'
import { DraftItem } from './DraftItem'
import { ErrorNotice } from './ErrorNotice'
import { Reasoning } from './Reasoning'
import { SearchCard } from './SearchCard'
import { StatusLine } from './StatusLine'
import { ThinkingIndicator } from './ThinkingIndicator'

interface ReplyContentProps {
  turn: AssistantTurn
  compact?: boolean
}

function activityLabel(turn: AssistantTurn): string {
  if (turn.loadingModel) return `Loading ${turn.loadingModel} · first run can take a minute`
  if (turn.activity === 'searching') return 'Searching'
  if (turn.activity === 'writing') return 'Writing the answer'
  return 'Thinking'
}

/** What the reply's live region says to screen readers: each search as it lands, then that the answer is ready. */
function announcement(turn: AssistantTurn): string {
  if (turn.status === 'done') return 'Answer ready'
  const search = turn.items.findLast((item) => item.kind === 'search')
  return search ? `Search finished: ${search.event.search.query}` : ''
}

/**
 * A reply in arrival order: status, reasoning, then each draft and search as it lands, then the answer as it streams,
 * and how it ended. Memoized, so while one reply streams, the finished replies around it don't render their Markdown
 * again.
 */
export const ReplyContent = memo(function ReplyContent({ turn, compact = false }: ReplyContentProps) {
  // A stopped or failed turn keeps the text that streamed before it ended.
  const answer = turn.result?.answer ?? turn.text

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {turn.status === 'queued' && <StatusLine icon={Clock} label="Queued" />}
      {turn.status === 'skipped' && <StatusLine icon={CircleDashed} label="Not run" />}
      {turn.status === 'streaming' && <ThinkingIndicator label={activityLabel(turn)} startedAt={turn.startedAt} />}
      {turn.reasoning !== '' && <Reasoning text={turn.reasoning} />}
      {turn.items.length > 0 && (
        <ol aria-label="Steps before the answer" className="space-y-2">
          {turn.items.map((item, index) => (
            <li key={index}>
              {item.kind === 'draft' ? (
                <DraftItem text={item.text} compact={compact} />
              ) : (
                <SearchCard event={item.event} setup={turn.setup} compact={compact} />
              )}
            </li>
          ))}
        </ol>
      )}
      {answer.trim() !== '' && <Answer text={answer} compact={compact} />}
      {turn.status === 'stopped' && <StatusLine icon={CircleStop} label="Stopped" />}
      {turn.error && <ErrorNotice message={turn.error} />}
      <p aria-live="polite" className="sr-only">
        {announcement(turn)}
      </p>
    </div>
  )
})
