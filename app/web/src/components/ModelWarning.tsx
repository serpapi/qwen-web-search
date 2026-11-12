import { Info, X } from 'lucide-react'
import { useState } from 'react'
import { TextWithCode } from './TextWithCode'

/**
 * Why the app didn't start with LOCAL_MODEL, such as a typo in .env. The fallback model works, so it's a quiet hint
 * that the user can close until the next page load.
 */
export function ModelWarning({ message }: { message: string | null }) {
  const [dismissed, setDismissed] = useState(false)

  return (
    // Always rendered, even while the config loads, so screen readers announce the message when it arrives.
    <div role="status" className="shrink-0">
      {message && !dismissed && (
        <div className="flex items-start gap-2.5 border-b border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm sm:px-6">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-blue-text" aria-hidden="true" />
          <p className="min-w-0 flex-1 wrap-break-word">
            <TextWithCode text={message} />
          </p>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss notice"
            className="-my-0.5 grid size-6 shrink-0 place-items-center rounded-md text-neutral-500 hover:bg-neutral-200 hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
