import { CircleAlert } from 'lucide-react'

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div role="alert" className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-700" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-bold">Request failed</p>
        <p className="mt-1.5 font-mono text-xs wrap-anywhere text-red-800">{message}</p>
      </div>
    </div>
  )
}
