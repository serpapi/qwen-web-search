import { formatCount } from '../format'
import { FORMAT_LABELS } from '../setups'
import type { SearchStep } from '../types'

interface PayloadViewerProps {
  id: string
  hidden: boolean
  payload: string
  step: SearchStep
}

/** The raw search result text, exactly as Qwen read it. */
export function PayloadViewer({ id, hidden, payload, step }: PayloadViewerProps) {
  return (
    <div id={id} hidden={hidden} className="mt-2">
      <p className="mb-1 flex justify-between gap-2 text-xs text-neutral-600">
        <span>What Qwen read</span>
        <span>
          {FORMAT_LABELS[step.format]}
          {step.tokens !== undefined && ` · ${formatCount(step.tokens, 'token')}`}
        </span>
      </p>
      <pre
        tabIndex={0}
        aria-label="Search payload"
        className="max-h-72 overflow-auto rounded-md border border-neutral-200 bg-white p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap wrap-anywhere"
      >
        {payload}
      </pre>
    </div>
  )
}
