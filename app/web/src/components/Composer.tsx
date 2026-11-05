import { ArrowUp } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

interface ComposerProps {
  onSend: (message: string) => void
  disabled: boolean
  placeholder: string
}

export function Composer({ onSend, disabled, placeholder }: ComposerProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputId = useId()
  const hintId = useId()
  const message = text.trim()

  // Hand focus back once a response has finished.
  useEffect(() => {
    if (!disabled) textareaRef.current?.focus()
  }, [disabled])

  function submit() {
    if (!message || disabled) return
    onSend(message)
    setText('')
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="mx-auto w-full max-w-3xl"
    >
      <div className="flex items-end gap-2 rounded-xl border border-neutral-300 bg-white p-1.5 shadow-sm focus-within:border-brand-blue focus-within:ring-1 focus-within:ring-brand-blue">
        <label htmlFor={inputId} className="sr-only">
          Message
        </label>
        <textarea
          id={inputId}
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          aria-describedby={hintId}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends and Shift+Enter adds a newline. Enter that confirms an IME composition (Chinese, Korean) does neither.
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              submit()
            }
          }}
          className="field-sizing-content max-h-48 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 outline-hidden placeholder:text-neutral-500 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled || !message}
          aria-label="Send"
          className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-gradient text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp className="size-5" aria-hidden="true" />
        </button>
      </div>
      <p id={hintId} className="mt-1.5 text-center text-xs text-neutral-500">
        Enter to send, Shift+Enter for a new line
      </p>
    </form>
  )
}
