import { X } from 'lucide-react'
import { useId } from 'react'
import type { Column } from '../columns'
import type { SetupId } from '../types'
import { ColumnNumber } from './ColumnNumber'
import { Select, type SelectOption } from './Select'

interface ColumnEditorProps {
  column: Column
  /** 1-based. */
  position: number
  modelOptions: SelectOption<string>[]
  setupOptions: SelectOption<SetupId>[]
  onChange: (column: Column) => void
  /** Undefined for the only column, which can't be removed. */
  onRemove: (() => void) | undefined
}

const LABEL = 'block text-xs font-bold text-neutral-600'

/** One column's model and setup, editable before the comparison starts. Laid out like the column heading it becomes. */
export function ColumnEditor({ column, position, modelOptions, setupOptions, onChange, onRemove }: ColumnEditorProps) {
  const modelId = useId()
  const setupId = useId()

  return (
    <div role="group" aria-label={`Column ${position}`} className="w-64 rounded-lg border border-neutral-200 bg-white p-3">
      <div className="mb-1 flex items-center gap-2">
        <ColumnNumber position={position} />
        <label htmlFor={modelId} className={LABEL}>
          Model
        </label>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove column ${position}`}
            className="-my-0.5 -mr-1.5 ml-auto grid size-6 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <Select
        id={modelId}
        mono
        value={column.model}
        options={modelOptions}
        onChange={(model) => onChange({ ...column, model })}
      />
      <label htmlFor={setupId} className={`mt-3 mb-1 ${LABEL}`}>
        Web search
      </label>
      <Select
        id={setupId}
        value={column.setup}
        options={setupOptions}
        onChange={(setup) => onChange({ ...column, setup })}
      />
    </div>
  )
}
