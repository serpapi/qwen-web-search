import { ChevronDown } from 'lucide-react'
import { useId } from 'react'
import type { ModelInfo } from '../types'

interface ModelPickerProps {
  models: ModelInfo[]
  defaultModel: string | null
  value: string
  onChange: (model: string) => void
}

export function ModelPicker({ models, defaultModel, value, onChange }: ModelPickerProps) {
  const id = useId()
  // LOCAL_MODEL can name a model the backend didn't list, such as a non-Qwen one. Offer it anyway.
  const unlisted = defaultModel !== null && !models.some((model) => model.name === defaultModel) ? defaultModel : undefined

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-xs font-bold text-neutral-600">
        Model
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="appearance-none rounded-lg border border-neutral-300 bg-white py-1 pr-7 pl-2.5 font-mono text-xs hover:border-neutral-400"
        >
          {unlisted && <option value={unlisted}>{unlisted}</option>}
          {models.map(({ name, parameters }) => (
            <option key={name} value={name}>
              {`${name} · ${parameters}`}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-neutral-500"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
