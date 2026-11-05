import { Check } from 'lucide-react'
import { useId } from 'react'
import { SETUP_INFO } from '../setups'
import type { SetupId } from '../types'

interface SetupChipsProps {
  setups: SetupId[]
  selected: SetupId[]
  onChange: (selected: SetupId[]) => void
  disabled: boolean
}

export function SetupChips({ setups, selected, onChange, disabled }: SetupChipsProps) {
  const labelId = useId()

  function toggle(setup: SetupId) {
    onChange(selected.includes(setup) ? selected.filter((id) => id !== setup) : [...selected, setup])
  }

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-wrap items-center gap-2">
      <span id={labelId} className="mr-1 text-sm font-bold text-neutral-600">
        Setups
      </span>
      {setups.map((setup) => {
        const on = selected.includes(setup)
        // At least one setup has to take part.
        const locked = on && selected.length === 1
        return (
          <button
            key={setup}
            type="button"
            aria-pressed={on}
            disabled={disabled || locked}
            onClick={() => toggle(setup)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold transition-colors disabled:cursor-not-allowed ${
              on
                ? 'border-brand-blue bg-brand-blue/10 text-brand-blue-text'
                : 'border-neutral-300 text-neutral-600 hover:border-neutral-400'
            }`}
          >
            {on && <Check className="size-3.5" aria-hidden="true" />}
            {SETUP_INFO[setup].name}
          </button>
        )
      })}
    </div>
  )
}
