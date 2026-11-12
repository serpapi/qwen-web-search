import { useId } from 'react'
import { SETUP_INFO } from '../setups'
import type { SetupId } from '../types'

interface SetupPickerProps {
  setups: SetupId[]
  value: SetupId
  onChange: (setup: SetupId) => void
}

export function SetupPicker({ setups, value, onChange }: SetupPickerProps) {
  const name = useId()
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold text-neutral-600">Web search</legend>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {setups.map((setup) => {
          const checked = setup === value
          return (
            <label
              key={setup}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-blue ${
                checked ? 'border-brand-blue ring-1 ring-brand-blue' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={setup}
                checked={checked}
                onChange={() => onChange(setup)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${
                  checked ? 'bg-brand-gradient' : 'border border-neutral-300'
                }`}
              >
                {checked && <span className="size-1.5 rounded-full bg-white" />}
              </span>
              <span>
                <span className="block text-sm font-bold">{SETUP_INFO[setup].name}</span>
                <span className="block text-xs text-neutral-600">{SETUP_INFO[setup].description}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
