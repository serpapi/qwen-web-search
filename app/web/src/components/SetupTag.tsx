import { SETUP_INFO } from '../setups'
import type { SetupId } from '../types'

export function SetupTag({ setup }: { setup: SetupId }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold">
      <span className="size-1.5 rounded-full bg-brand-gradient" aria-hidden="true" />
      {SETUP_INFO[setup].name}
    </span>
  )
}
