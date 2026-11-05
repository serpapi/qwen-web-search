const EXAMPLES = [
  { text: 'Who won the 2026 Nobel Peace Prize?', lang: 'en' },
  { text: '2026年全国高考报名人数是多少？', lang: 'zh' },
  { text: '2027년 최저시급은 얼마인가요?', lang: 'ko' },
]

interface ExamplePromptsProps {
  onPick: (prompt: string) => void
  disabled: boolean
}

export function ExamplePrompts({ onPick, disabled }: ExamplePromptsProps) {
  return (
    <ul aria-label="Example prompts" className="grid gap-2 sm:grid-cols-3">
      {EXAMPLES.map(({ text, lang }) => (
        <li key={text}>
          <button
            type="button"
            lang={lang}
            disabled={disabled}
            onClick={() => onPick(text)}
            className="h-full w-full rounded-lg border border-neutral-200 bg-white p-3 text-left text-sm transition-colors hover:border-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            {text}
          </button>
        </li>
      ))}
    </ul>
  )
}
