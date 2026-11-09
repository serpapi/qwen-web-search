import { ChevronDown } from 'lucide-react'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectProps<T extends string> {
  /** For the <label htmlFor> that names it. */
  id: string
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  /** Monospace text, for model names. */
  mono?: boolean
}

/** A native select with the app's styling. */
export function Select<T extends string>({ id, value, options, onChange, mono = false }: SelectProps<T>) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        // The options render in order, so the selected index gives the typed value.
        onChange={(event) => onChange(options[event.target.selectedIndex].value)}
        className={`w-full appearance-none rounded-lg border border-neutral-300 bg-white py-1 pr-7 pl-2.5 text-sm hover:border-neutral-400 ${
          mono ? 'font-mono' : ''
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-neutral-500"
        aria-hidden="true"
      />
    </div>
  )
}
