import { Plus } from 'lucide-react'
import { useId } from 'react'
import type { Column } from '../columns'
import { SETUP_INFO } from '../setups'
import { ColumnNumber } from './ColumnNumber'

interface ColumnSummaryProps {
  columns: Column[]
  onNewComparison: () => void
}

/** The columns of a comparison in progress, read-only, and the way to start over and change them. */
export function ColumnSummary({ columns, onNewComparison }: ColumnSummaryProps) {
  const labelId = useId()

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span id={labelId} className="text-sm font-bold text-neutral-600">
        Columns
      </span>
      <ol aria-labelledby={labelId} className="flex flex-wrap gap-2">
        {columns.map((column, index) => (
          <li key={index} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 py-0.5 pr-2.5 pl-0.5 text-xs">
            <ColumnNumber position={index + 1} />
            <span>
              <span className="font-mono font-bold">{column.model}</span> · {SETUP_INFO[column.setup].name}
            </span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onNewComparison}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1 text-sm font-bold hover:bg-neutral-50"
      >
        <Plus className="size-4" aria-hidden="true" />
        New comparison
      </button>
    </div>
  )
}
