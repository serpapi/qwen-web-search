import { formatCount, formatNumber } from '../format'

interface TokenBarProps {
  prompt: number
  /** The part of the prompt that is search results. */
  searchResults: number
  completion: number
}

/** Prompt and completion tokens as a stacked bar, with the search results marked inside the prompt they're part of. */
export function TokenBar({ prompt, searchResults, completion }: TokenBarProps) {
  const searchShare = prompt > 0 ? Math.min(1, searchResults / prompt) : 0
  const label =
    `Prompt: ${formatCount(prompt, 'token')}, including ${formatNumber(searchResults)} of search results. ` +
    `Completion: ${formatCount(completion, 'token')}.`

  return (
    <div role="img" aria-label={label} className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-neutral-200">
      <div className="flex min-w-1 basis-0 bg-brand-blue/35" style={{ flexGrow: prompt }}>
        <div className="bg-brand-blue" style={{ width: `${searchShare * 100}%` }} />
      </div>
      <div className="min-w-1 basis-0 bg-brand-purple" style={{ flexGrow: completion }} />
    </div>
  )
}
