interface Example {
  text: string
  lang: string
  /** What a non-English prompt asks, for readers who don't speak the language. */
  gloss?: string
}

const EXAMPLES: Example[] = [
  { text: "What's the latest version of Next.js?", lang: 'en' },
  { text: '2026年全国高考报名人数是多少？', lang: 'zh', gloss: "China's 2026 gaokao applicants" },
  { text: '2026 한국시리즈 우승팀은?', lang: 'ko', gloss: 'Winner of the 2026 Korean Series (baseball)' },
]

interface ExamplePromptsProps {
  onPick: (prompt: string) => void
  disabled: boolean
}

export function ExamplePrompts({ onPick, disabled }: ExamplePromptsProps) {
  return (
    <ul aria-label="Example prompts" className="grid gap-2 sm:grid-cols-3">
      {EXAMPLES.map(({ text, lang, gloss }) => (
        <li key={text}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPick(text)}
            className="flex h-full w-full flex-col rounded-lg border border-neutral-200 bg-white p-3 text-left text-sm transition-colors hover:border-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span lang={lang}>{text}</span>
            {gloss && <span className="mt-1 text-xs text-neutral-600">{gloss}</span>}
          </button>
        </li>
      ))}
    </ul>
  )
}
