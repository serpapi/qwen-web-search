import { Collapsible } from './Collapsible'

/** Qwen's thinking for a turn, closed by default. It can run to 10,000+ tokens, so it renders only when opened. */
export function Reasoning({ text }: { text: string }) {
  return (
    <Collapsible
      className="text-xs text-neutral-600"
      summary={
        <span className="font-bold">
          <span className="group-open:hidden">Show reasoning</span>
          <span className="hidden group-open:inline">Hide reasoning</span>
        </span>
      }
    >
      <p className="mt-2 max-h-80 overflow-y-auto rounded-md border border-neutral-200 bg-neutral-50 p-3 leading-relaxed whitespace-pre-wrap wrap-break-word text-neutral-700">
        {text}
      </p>
    </Collapsible>
  )
}
