import { Fragment } from 'react'

/** A server message whose commands are in backticks, as in "Start it with `ollama serve`", with those shown as code. */
export function TextWithCode({ text }: { text: string }) {
  return text.split('`').map((part, index) =>
    // Splitting on backticks puts the code at the odd positions.
    index % 2 === 1 ? (
      <code key={index} className="rounded bg-black/5 px-1 py-0.5 font-mono text-[0.9em]">
        {part}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  )
}
