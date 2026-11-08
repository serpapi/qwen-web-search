import { Check } from 'lucide-react'
import { useId } from 'react'
import { sameColumns, type Column } from '../columns'
import type { Preset } from '../presets'

interface PresetButtonsProps {
  presets: Preset[]
  /** The current columns, to mark the preset they match. */
  columns: Column[]
  onPick: (columns: Column[]) => void
}

export function PresetButtons({ presets, columns, onPick }: PresetButtonsProps) {
  const labelId = useId()

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-wrap items-center gap-2">
      <span id={labelId} className="mr-1 text-sm font-bold text-neutral-600">
        Presets
      </span>
      {presets.map((preset) => {
        const active = sameColumns(preset.columns, columns)
        return (
          <button
            key={preset.name}
            type="button"
            aria-pressed={active}
            // aria-disabled rather than disabled keeps the button focusable, so screen readers reach the reason.
            aria-disabled={preset.unavailable !== undefined}
            title={preset.unavailable}
            onClick={() => {
              if (preset.unavailable === undefined) onPick(preset.columns)
            }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold transition-colors aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${
              active
                ? 'border-brand-blue bg-brand-blue/10 text-brand-blue-text'
                : 'border-neutral-300 text-neutral-600 not-aria-disabled:hover:border-neutral-400'
            }`}
          >
            {active && <Check className="size-3.5" aria-hidden="true" />}
            {preset.name}
          </button>
        )
      })}
    </div>
  )
}
