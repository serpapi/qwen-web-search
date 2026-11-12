import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'

/** How long "Copied" or "Couldn't copy" shows after a click. */
const FEEDBACK_MS = 2000

/** Copies a finished answer as its raw Markdown, which pastes well anywhere. */
export function CopyAnswer({ answer }: { answer: string }) {
  // A new object on every click, so a second click restarts the timer.
  const [feedback, setFeedback] = useState<{ copied: boolean } | null>(null)

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [feedback])

  async function copy() {
    try {
      await navigator.clipboard.writeText(answer)
      setFeedback({ copied: true })
    } catch {
      // The browser can refuse, and outside a secure context (http on a host other than localhost) there's no clipboard.
      setFeedback({ copied: false })
    }
  }

  const Icon = feedback?.copied ? Check : Copy

  return (
    // The negative margin lines the icon up with the answer text, while the button keeps a 24 px target.
    <div className="-ml-1 flex items-center gap-1.5">
      <button
        type="button"
        onClick={copy}
        aria-label="Copy answer"
        className="grid size-6 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-brand-blue-text focus-visible:text-brand-blue-text"
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </button>
      {/* Always rendered, so screen readers announce the text when it appears. */}
      <span aria-live="polite" className="text-xs text-neutral-600">
        {feedback && (feedback.copied ? 'Copied' : "Couldn't copy")}
      </span>
    </div>
  )
}
