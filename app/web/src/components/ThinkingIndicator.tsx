import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ThinkingIndicatorProps {
  /** What's happening, such as "Thinking". */
  label: string
  /** When the model started, in epoch milliseconds. Undefined while it loads, which shows no timer. */
  startedAt: number | undefined
}

export function ThinkingIndicator({ label, startedAt }: ThinkingIndicatorProps) {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <p className="flex items-center gap-2 text-sm text-neutral-600">
      <LoaderCircle className="size-4 shrink-0 animate-spin text-brand-blue" aria-hidden="true" />
      <span>
        {label}
        {startedAt !== undefined && (
          <>
            {' · '}
            <span className="tabular-nums">{Math.max(0, Math.floor((now - startedAt) / 1000))} s</span>
          </>
        )}
      </span>
    </p>
  )
}
