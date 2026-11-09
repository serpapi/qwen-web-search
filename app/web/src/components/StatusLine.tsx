import type { LucideIcon } from 'lucide-react'

interface StatusLineProps {
  icon: LucideIcon
  label: string
}

/** A quiet, one-line reply state, such as "Queued" or "Stopped". */
export function StatusLine({ icon: Icon, label }: StatusLineProps) {
  return (
    <p className="flex items-center gap-2 text-sm text-neutral-600">
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </p>
  )
}
