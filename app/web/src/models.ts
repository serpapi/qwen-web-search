import type { SelectOption } from './components/Select'
import type { ModelInfo } from './types'

/** Options for a model select, such as "qwen3.8:27b · 27.3B", biggest first. */
export function modelOptions(models: ModelInfo[], defaultModel: string | null): SelectOption<string>[] {
  const options = models.map(({ name, parameters }) => ({ value: name, label: `${name} · ${parameters}` }))
  // LOCAL_MODEL can name a model the backend didn't list, such as a non-Qwen one. Offer it anyway.
  if (defaultModel !== null && !models.some((model) => model.name === defaultModel)) {
    return [{ value: defaultModel, label: defaultModel }, ...options]
  }
  return options
}
