import { MAX_COLUMNS, type Column } from './columns'

export interface Preset {
  name: string
  /** The columns it fills. Empty when it doesn't apply. */
  columns: Column[]
  /** Why it doesn't apply to the installed models, or undefined when it does. */
  unavailable?: string
}

/**
 * The Battleground presets, filled with real model names.
 * models are the installed ones, biggest first. defaultModel is the backend's default, which may not be among them.
 */
export function buildPresets(models: string[], defaultModel: string): Preset[] {
  const unavailable = models.length < 2 ? 'Needs at least 2 installed Qwen models' : undefined
  const biggest = models[0]
  const smallest = models[models.length - 1]
  return [
    {
      name: 'Search vs no search',
      columns: [
        { model: defaultModel, setup: 'serpapi' },
        { model: defaultModel, setup: 'none' },
      ],
    },
    {
      name: 'Google vs multiple engines',
      columns: [
        { model: defaultModel, setup: 'serpapi-google' },
        { model: defaultModel, setup: 'serpapi' },
      ],
    },
    {
      name: 'Model vs model',
      columns: unavailable ? [] : models.slice(0, MAX_COLUMNS).map((model) => ({ model, setup: 'serpapi' })),
      unavailable,
    },
    {
      name: 'Small + search vs big alone',
      columns: unavailable
        ? []
        : [
            { model: smallest, setup: 'serpapi' },
            { model: biggest, setup: 'none' },
          ],
      unavailable,
    },
  ]
}
