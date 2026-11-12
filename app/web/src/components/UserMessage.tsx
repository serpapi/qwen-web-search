import { koreanLang } from '../lang'

interface UserMessageProps {
  text: string
  compact?: boolean
}

export function UserMessage({ text, compact = false }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <p
        className={`max-w-[85%] rounded-2xl rounded-br-md bg-neutral-100 whitespace-pre-wrap wrap-anywhere ${
          compact ? 'px-3 py-2 text-sm' : 'px-4 py-2.5'
        }`}
      >
        <span className="sr-only">You: </span>
        <span lang={koreanLang(text)}>{text}</span>
      </p>
    </div>
  )
}
