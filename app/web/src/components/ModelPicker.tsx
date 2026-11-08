import { useId } from 'react'
import { modelOptions } from '../models'
import type { ModelInfo } from '../types'
import { Select } from './Select'

interface ModelPickerProps {
  models: ModelInfo[]
  defaultModel: string | null
  value: string
  onChange: (model: string) => void
}

/** The Dedicated-mode model, in the header. */
export function ModelPicker({ models, defaultModel, value, onChange }: ModelPickerProps) {
  const id = useId()
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-xs font-bold text-neutral-600">
        Model
      </label>
      <Select id={id} mono value={value} options={modelOptions(models, defaultModel)} onChange={onChange} />
    </div>
  )
}
