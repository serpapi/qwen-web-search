import { CircleAlert } from 'lucide-react'
import { Collapsible } from './Collapsible'
import { TextWithCode } from './TextWithCode'

/** "KeyError: 'choices'": an error passed on as it was, which the server didn't explain. */
const RAW_ERROR = /^[A-Za-z_]\w*:(\s|$)/

/** A failed request. Explained errors show as they are. Raw ones get a plain headline, with the details one click away. */
export function ErrorNotice({ message }: { message: string }) {
  const raw = RAW_ERROR.test(message)

  return (
    <div role="alert" className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-700" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {raw ? (
          <>
            <p className="font-bold">Something went wrong</p>
            <Collapsible summary="Details" className="mt-1 text-xs text-red-800">
              <p className="mt-1.5 font-mono whitespace-pre-wrap wrap-anywhere">{message}</p>
            </Collapsible>
          </>
        ) : (
          <p className="wrap-break-word">
            <TextWithCode text={message} />
          </p>
        )}
      </div>
    </div>
  )
}
