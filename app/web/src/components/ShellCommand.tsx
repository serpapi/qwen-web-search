/** A command to run in a terminal. One click selects all of it, ready to copy. */
export function ShellCommand({ command }: { command: string }) {
  return (
    <pre className="rounded-lg bg-ink px-4 py-3 text-left font-mono text-sm leading-relaxed whitespace-pre-wrap text-white select-all">
      <code>{command}</code>
    </pre>
  )
}
