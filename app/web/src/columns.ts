import { SETUP_INFO } from './setups'
import type { SetupId } from './types'

/**
 * A Battleground column: a model and a setup. Several columns may share a model, a setup or both,
 * so a column is known by its position.
 */
export interface Column {
  model: string
  setup: SetupId
}

export const MAX_COLUMNS = 4

/** "qwen3.8:27b · SerpApi · Google" */
export function columnLabel({ model, setup }: Column): string {
  return `${model} · ${SETUP_INFO[setup].name}`
}

export function sameColumns(a: Column[], b: Column[]): boolean {
  return a.length === b.length && a.every((column, index) => column.model === b[index].model && column.setup === b[index].setup)
}
