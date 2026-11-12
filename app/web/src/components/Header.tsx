import { Plus } from 'lucide-react'
import logo from '../assets/serpapi-logo.svg'
import type { ConfigState } from '../hooks/useConfig'
import { ModelPicker } from './ModelPicker'
import { ModeToggle, type Mode } from './ModeToggle'

interface HeaderProps {
  config: ConfigState
  /** The Dedicated-mode model, or null when there's none to pick. */
  model: string | null
  onModelChange: (model: string) => void
  mode: Mode
  onModeChange: (mode: Mode) => void
  /** Clears the current mode's conversation: a new chat, or a new comparison in Battleground. */
  onStartOver: () => void
  canStartOver: boolean
}

export function Header({ config, model, onModelChange, mode, onModeChange, onStartOver, canStartOver }: HeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-neutral-200 px-4 py-2.5 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <img src={logo} alt="SerpApi" className="h-6 w-auto" />
        <span className="h-5 w-px bg-neutral-300" aria-hidden="true" />
        <h1 className="text-lg font-bold whitespace-nowrap">Qwen</h1>
        {config.status === 'loading' && (
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs text-neutral-700">
            Connecting…
          </span>
        )}
        {/* Battleground columns each pick their own model. */}
        {config.status === 'ready' && model !== null && mode === 'dedicated' && (
          <ModelPicker
            models={config.config.models}
            defaultModel={config.config.default_model}
            value={model}
            onChange={onModelChange}
          />
        )}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <ModeToggle mode={mode} onChange={onModeChange} />
        <button
          type="button"
          onClick={onStartOver}
          disabled={!canStartOver}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-bold hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          {mode === 'dedicated' ? 'New chat' : 'New comparison'}
        </button>
      </div>
    </header>
  )
}
