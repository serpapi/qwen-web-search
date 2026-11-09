import { Plus } from 'lucide-react'
import { useId } from 'react'
import type { Column } from '../columns'
import { ColumnLabel } from './ColumnLabel'

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
          <li key={index} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1">
            <ColumnLabel position={index + 1} model={column.model} setup={column.setup} inline />
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
