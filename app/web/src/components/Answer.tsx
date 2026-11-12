import Markdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { koreanLang } from '../lang'

const remarkPlugins = [remarkGfm]

const components: Components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
}

export function Answer({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div lang={koreanLang(text)} className={`markdown ${compact ? 'text-sm' : 'text-[15px]'}`}>
      <Markdown remarkPlugins={remarkPlugins} components={components}>
        {text}
      </Markdown>
    </div>
  )
}
