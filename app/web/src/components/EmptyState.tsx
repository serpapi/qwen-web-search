import type { ReactNode } from 'react'
import icon from '../assets/serpapi-icon.svg'

interface EmptyStateProps {
  title: string
  description: string
  children: ReactNode
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-10 text-center">
      <img src={icon} alt="" className="size-10" />
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-2 text-neutral-600">{description}</p>
      <div className="mt-6 w-full">{children}</div>
    </div>
  )
}
