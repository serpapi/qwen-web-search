import { FORMAT_LABELS } from '../setups'
import type { SearchStep } from '../types'

const STYLES: Record<SearchStep['format'], string> = {
  markdown: 'bg-brand-blue/10 text-brand-blue-text',
  json: 'bg-brand-purple/10 text-brand-purple',
  error: 'bg-red-100 text-red-800',
}

export function FormatBadge({ format }: { format: SearchStep['format'] }) {
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold ${STYLES[format]}`}>
      {FORMAT_LABELS[format]}
    </span>
  )
}
