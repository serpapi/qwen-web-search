import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThinkingIndicator({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000))
  return (
    <p className="flex items-center gap-2 text-sm text-neutral-600">
      <LoaderCircle className="size-4 animate-spin text-brand-blue" aria-hidden="true" />
      <span>
        Thinking · <span className="tabular-nums">{seconds} s</span>
      </span>
    </p>
  )
}
