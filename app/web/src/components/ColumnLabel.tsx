import { SETUP_INFO } from '../setups'
import type { SetupId } from '../types'
import { ColumnNumber } from './ColumnNumber'

interface ColumnLabelProps {
  /** 1-based. */
  position: number
  model: string
  setup: SetupId
  /** Model and setup on one line when they fit, as in the comparison table. Otherwise the setup goes under the model. */
  inline?: boolean
}

/**
 * A column's number, model and setup, styled the same in its heading and its comparison-table row.
 * The number lines up with the model's first line, since both are 20px tall.
 */
export function ColumnLabel({ position, model, setup, inline = false }: ColumnLabelProps) {
  return (
    <span className="flex items-start gap-2">
      <ColumnNumber position={position} />
      <span className={inline ? 'flex min-w-0 flex-wrap gap-x-2' : 'min-w-0'}>
        <span className="block font-mono text-base leading-5 font-bold text-neutral-900 wrap-anywhere">{model}</span>{' '}
        <span className="block text-sm leading-5 font-bold text-neutral-800">{SETUP_INFO[setup].name}</span>
      </span>
    </span>
  )
}
