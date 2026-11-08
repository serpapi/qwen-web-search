import { Plus } from 'lucide-react'
import { MAX_COLUMNS, type Column } from '../columns'
import { modelOptions } from '../models'
import type { Preset } from '../presets'
import { SETUP_INFO } from '../setups'
import type { ModelInfo, SetupId } from '../types'
import { ColumnEditor } from './ColumnEditor'
import { PresetButtons } from './PresetButtons'

interface ColumnSetupProps {
  columns: Column[]
  presets: Preset[]
  models: ModelInfo[]
  defaultModel: string
  setups: SetupId[]
  onChange: (columns: Column[]) => void
}

/** Picks the columns before a comparison starts: from a preset, or a model and setup per column. */
export function ColumnSetup({ columns, presets, models, defaultModel, setups, onChange }: ColumnSetupProps) {
  const modelChoices = modelOptions(models, defaultModel)
  const setupChoices = setups.map((setup) => ({ value: setup, label: SETUP_INFO[setup].name }))

  return (
    <div className="space-y-3">
      <PresetButtons presets={presets} columns={columns} onPick={onChange} />
      <div className="flex flex-wrap items-stretch gap-2">
        <ol aria-label="Columns" className="flex flex-wrap gap-2">
          {columns.map((column, index) => (
            <li key={index}>
              <ColumnEditor
                column={column}
                position={index + 1}
                modelOptions={modelChoices}
                setupOptions={setupChoices}
                onChange={(changed) => onChange(columns.with(index, changed))}
                onRemove={columns.length > 1 ? () => onChange(columns.toSpliced(index, 1)) : undefined}
              />
            </li>
          ))}
        </ol>
        {columns.length < MAX_COLUMNS && (
          <button
            type="button"
            // A copy of the last column, so a comparison only needs one setting changed.
            onClick={() => onChange([...columns, columns[columns.length - 1]])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-4 text-sm font-bold text-neutral-600 hover:border-brand-blue hover:text-brand-blue-text"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add column
          </button>
        )}
      </div>
    </div>
  )
}
