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

function buttonStyle(active: boolean, unavailable: boolean): string {
  if (active) return 'border-brand-blue bg-brand-blue/10 text-brand-blue-text'
  if (unavailable) return 'cursor-not-allowed border-dashed border-neutral-300 text-neutral-500'
  return 'border-neutral-300 text-neutral-600 hover:border-neutral-400'
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
        const unavailable = preset.unavailable !== undefined
        return (
          <button
            key={preset.name}
            type="button"
            aria-pressed={active}
            // aria-disabled rather than disabled keeps the button focusable, so screen readers reach the reason.
            aria-disabled={unavailable}
            onClick={() => {
              if (!unavailable) onPick(preset.columns)
            }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold transition-colors ${buttonStyle(active, unavailable)}`}
          >
            {active && <Check className="size-3.5" aria-hidden="true" />}
            {preset.name}
            {unavailable && <span className="font-normal">· {preset.unavailable}</span>}
          </button>
        )
      })}
    </div>
  )
}
