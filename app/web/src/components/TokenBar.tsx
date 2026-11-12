import { formatCount } from '../format'

interface TokenBarProps {
  prompt: number
  /** Search payload tokens, which are part of the prompt. */
  searchPayload: number
  completion: number
}

/** Prompt and completion tokens as one stacked bar, with the search payload drawn as a slice of the prompt. */
export function TokenBar({ prompt, searchPayload, completion }: TokenBarProps) {
  // The two counts come from different tokenizers, so cap the slice to keep it inside the prompt.
  const payload = Math.min(searchPayload, prompt)
  const label =
    `Prompt: ${formatCount(prompt, 'token')}` +
    (payload > 0 ? `, including ${formatCount(payload, 'token')} of search payload. ` : '. ') +
    `Completion: ${formatCount(completion, 'token')}.`

  return (
    <div role="img" aria-label={label} className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-neutral-200">
      <div className="min-w-1 basis-0 bg-brand-blue" style={{ flexGrow: prompt - payload }} />
      {payload > 0 && <div className="min-w-1 basis-0 bg-ink" style={{ flexGrow: payload }} />}
      <div className="min-w-1 basis-0 bg-brand-purple" style={{ flexGrow: completion }} />
    </div>
  )
}
