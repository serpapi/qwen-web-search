export type Mode = 'dedicated' | 'battleground'

const MODES: { id: Mode; label: string }[] = [
  { id: 'dedicated', label: 'Dedicated' },
  { id: 'battleground', label: 'Battleground' },
]

interface ModeToggleProps {
  mode: Mode
  onChange: (mode: Mode) => void
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div role="group" aria-label="Mode" className="flex rounded-lg bg-neutral-100 p-0.5">
      {MODES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={mode === id}
          onClick={() => onChange(id)}
          className={`rounded-md px-3 py-1.5 text-sm font-bold ${
            mode === id ? 'bg-brand-gradient text-white shadow-sm' : 'text-neutral-600 hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
