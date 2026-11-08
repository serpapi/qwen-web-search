/** A column's position, shown wherever the column appears so they're easy to match up. */
export function ColumnNumber({ position }: { position: number }) {
  return (
    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white tabular-nums">
      <span className="sr-only">Column </span>
      {position}
    </span>
  )
}
