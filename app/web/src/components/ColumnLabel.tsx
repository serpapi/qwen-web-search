import { SETUP_INFO } from '../setups'
import type { SetupId } from '../types'
import { ColumnNumber } from './ColumnNumber'

interface ColumnLabelProps {
  /** 1-based. */
  position: number
  model: string
  setup: SetupId
}

/** A column's number, model and setup, as in its heading and its comparison-table row. */
export function ColumnLabel({ position, model, setup }: ColumnLabelProps) {
  return (
    <span className="flex items-start gap-2">
      <ColumnNumber position={position} />
      <span className="min-w-0">
        <span className="block font-mono font-bold wrap-anywhere">{model}</span>
        <span className="block">{SETUP_INFO[setup].name}</span>
      </span>
    </span>
  )
}
