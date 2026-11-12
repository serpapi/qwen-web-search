import { RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ConfigState } from '../hooks/useConfig'
import { EmptyState } from './EmptyState'
import { ShellCommand } from './ShellCommand'
import { TextWithCode } from './TextWithCode'

/** The settings the demo and its benchmark run Ollama with. */
const OLLAMA_SERVE = 'OLLAMA_CONTEXT_LENGTH=32768 OLLAMA_FLASH_ATTENTION=1 OLLAMA_KV_CACHE_TYPE=q8_0 ollama serve'

interface Fix {
  title: string
  description: ReactNode
  command?: { label: string; text: string }
}

/** What's wrong and how to fix it. A config that loaded is only shown here when it has no model. */
function fixFor(config: Exclude<ConfigState, { status: 'loading' }>): Fix {
  if (config.status === 'ready') {
    return {
      title: 'No Qwen model installed',
      description: 'Pull a Qwen model with tool support that fits your memory, then retry.',
      command: { label: 'For example:', text: 'ollama pull qwen3.5:9b' },
    }
  }
  const { problem } = config
  if (problem.kind === 'server-unreachable') {
    return {
      title: "Can't reach the app server",
      description: 'Start it, then retry.',
      command: { label: 'In the `app/` folder:', text: 'python server.py' },
    }
  }
  if (problem.kind === 'ollama-down') {
    return {
      title: "Ollama isn't running",
      description: <TextWithCode text={problem.detail} />,
      command: { label: 'With the settings this demo uses:', text: OLLAMA_SERVE },
    }
  }
  return { title: 'Something went wrong', description: <TextWithCode text={problem.message} /> }
}

interface StartupNoticeProps {
  config: ConfigState
  /** True while the config is being fetched again. */
  checking: boolean
  onRetry: () => void
}

/** Takes the place of both modes until the app can chat, and shows how to get there. */
export function StartupNotice({ config, checking, onRetry }: StartupNoticeProps) {
  if (config.status === 'loading') return <main aria-busy="true" className="flex-1" />
  const { title, description, command } = fixFor(config)

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6">
      <EmptyState title={title} description={description}>
        <div className="space-y-5">
          {command && (
            <div className="text-left">
              <p className="mb-1.5 text-sm text-neutral-600">
                <TextWithCode text={command.label} />
              </p>
              <ShellCommand command={command.text} />
            </div>
          )}
          <button
            type="button"
            onClick={onRetry}
            disabled={checking}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70"
          >
            <RotateCw className={`size-4 ${checking ? 'animate-spin' : ''}`} aria-hidden="true" />
            {checking ? 'Checking…' : 'Retry'}
          </button>
        </div>
      </EmptyState>
    </main>
  )
}
