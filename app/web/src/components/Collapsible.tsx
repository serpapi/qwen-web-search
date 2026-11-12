import { ChevronRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface CollapsibleProps {
  /** The line that opens and closes it. group-open: classes inside it can follow the state. */
  summary: ReactNode
  /** Rendered only while open, so a long text, such as Qwen's reasoning, costs nothing while it's closed. */
  children: ReactNode
  className?: string
}

/** A native disclosure, closed at first. */
export function Collapsible({ summary, children, className = '' }: CollapsibleProps) {
  const [open, setOpen] = useState(false)

  return (
    <details onToggle={(event) => setOpen(event.currentTarget.open)} className={`group ${className}`}>
      <summary className="flex cursor-pointer items-start gap-1.5 rounded-sm">
        <ChevronRight className="mt-0.5 size-3.5 shrink-0 transition-transform group-open:rotate-90" aria-hidden="true" />
        {summary}
      </summary>
      {open && children}
    </details>
  )
}
