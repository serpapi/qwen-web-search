import { Answer } from './Answer'
import { Collapsible } from './Collapsible'

/** The draft as one line of plain text: link text without its URL, and no Markdown symbols. */
function preview(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

interface DraftItemProps {
  text: string
  compact: boolean
}

/** Text Qwen wrote before it searched again. Not the answer, so it stays collapsed and muted. */
export function DraftItem({ text, compact }: DraftItemProps) {
  return (
    <Collapsible
      className={`rounded-lg border border-dashed border-neutral-300 text-neutral-600 ${compact ? 'p-2.5 text-xs' : 'p-3 text-sm'}`}
      summary={
        <span className="min-w-0 flex-1">
          <span className="block font-bold">Draft before searching again</span>
          <span className="block truncate group-open:hidden">{preview(text)}</span>
        </span>
      }
    >
      <div className="mt-2 pl-5">
        <Answer text={text} compact />
      </div>
    </Collapsible>
  )
}
