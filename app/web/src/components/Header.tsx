import { Plus } from 'lucide-react'
import logo from '../assets/serpapi-logo.svg'
import type { ConfigState } from '../hooks/useConfig'
import { ModeToggle, type Mode } from './ModeToggle'

interface HeaderProps {
  config: ConfigState
  mode: Mode
  onModeChange: (mode: Mode) => void
  onNewChat: () => void
  canStartNewChat: boolean
}

export function Header({ config, mode, onModeChange, onNewChat, canStartNewChat }: HeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-neutral-200 px-4 py-2.5 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <img src={logo} alt="SerpApi" className="h-6 w-auto" />
        <span className="h-5 w-px bg-neutral-300" aria-hidden="true" />
        <h1 className="text-lg font-bold whitespace-nowrap">Qwen + SerpApi</h1>
        {config.status === 'error' ? (
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">Backend unreachable</span>
        ) : (
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 font-mono text-xs whitespace-nowrap text-neutral-700">
            {config.status === 'ready' ? `${config.config.model} · local` : 'Connecting…'}
          </span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <ModeToggle mode={mode} onChange={onModeChange} />
        <button
          type="button"
          onClick={onNewChat}
          disabled={!canStartNewChat}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-bold hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          New chat
        </button>
      </div>
    </header>
  )
}
