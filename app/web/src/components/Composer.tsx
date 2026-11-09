import { ArrowUp, Square } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

interface ComposerProps {
  onSend: (message: string) => void
  onStop: () => void
  /**
   * The question being answered while this view's response runs, otherwise undefined. While it runs, the send button
   * becomes Stop, and stopping puts the question back into an empty composer so it can be corrected and resent.
   */
  pendingQuestion: string | undefined
  /** Blocks typing and sending, such as while the other mode is answering. */
  disabled: boolean
  placeholder: string
}

const BUTTON = 'grid size-10 shrink-0 place-items-center rounded-lg text-white'

export function Composer({ onSend, onStop, pendingQuestion, disabled, placeholder }: ComposerProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputId = useId()
  const hintId = useId()
  const message = text.trim()
  const running = pendingQuestion !== undefined
  const canSend = !disabled && !running

  // Hand focus back once a response has finished or been stopped.
  useEffect(() => {
    if (canSend) textareaRef.current?.focus()
  }, [canSend])

  function submit() {
    if (!message || !canSend) return
    onSend(message)
    setText('')
  }

  function stop() {
    onStop()
    if (!message) setText(pendingQuestion ?? '')
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
        {/* Stays editable while a response runs, so the next message can be drafted. */}
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
            // Keys that confirm or cancel an IME composition (Chinese, Korean) belong to the IME.
            if (event.nativeEvent.isComposing) return
            if (event.key === 'Escape' && running) {
              event.preventDefault()
              stop()
            }
            // Enter sends and Shift+Enter adds a newline.
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          className="field-sizing-content max-h-48 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 outline-hidden placeholder:text-neutral-500 disabled:cursor-not-allowed"
        />
        {/* Distinct keys make Stop and Send separate elements, so the click that stops can never submit the form. */}
        {running ? (
          <button
            key="stop"
            type="button"
            onClick={stop}
            aria-label="Stop generating"
            className={`${BUTTON} bg-ink hover:bg-neutral-700`}
          >
            <Square className="size-3.5" fill="currentColor" aria-hidden="true" />
          </button>
        ) : (
          <button
            key="send"
            type="submit"
            disabled={!canSend || !message}
            aria-label="Send"
            className={`${BUTTON} bg-brand-gradient transition-opacity disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <ArrowUp className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>
      <p id={hintId} className="mt-1.5 text-center text-xs text-neutral-500">
        {running ? 'Escape to stop the response' : 'Enter to send, Shift+Enter for a new line'}
      </p>
    </form>
  )
}
