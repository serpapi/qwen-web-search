import { useState } from 'react'
import { BattlegroundView } from './components/BattlegroundView'
import { DedicatedView } from './components/DedicatedView'
import { Header } from './components/Header'
import type { Mode } from './components/ModeToggle'
import { useBattleground } from './hooks/useBattleground'
import { useConfig } from './hooks/useConfig'
import { useDedicatedChat } from './hooks/useDedicatedChat'
import { SETUP_IDS } from './setups'
import type { SetupId } from './types'

export default function App() {
  const config = useConfig()
  const [mode, setMode] = useState<Mode>('dedicated')
  // The Dedicated-mode model. Null until the user picks one, so the backend's default applies once the config arrives.
  const [pickedModel, setPickedModel] = useState<string | null>(null)
  const dedicated = useDedicatedChat()
  const battle = useBattleground()

  const ready = config.status === 'ready' ? config.config : undefined
  const setups = ready?.setups ?? SETUP_IDS
  // Null while the config loads, or when there's no model at all. Then neither mode can send.
  const defaultModel = ready?.default_model ?? null
  const model = pickedModel ?? defaultModel
  const current =
    mode === 'dedicated'
      ? { reset: dedicated.reset, empty: dedicated.exchanges.length === 0 }
      : { reset: battle.reset, empty: battle.rounds.length === 0 }

  /** Why a mode can't send. Both modes share one local Ollama, so each waits while the other one answers. */
  function disabledReason(otherMode: string, otherModeBusy: boolean): string | undefined {
    if (defaultModel === null) return 'No model available'
    return otherModeBusy ? `Waiting for the ${otherMode} response…` : undefined
  }

  // Sending is disabled while there's no model, so this check only narrows the type.
  function sendDedicated(question: string, setup: SetupId) {
    if (model !== null) dedicated.send(question, setup, model)
  }

  return (
    <div className="flex h-dvh flex-col">
      <Header
        config={config}
        model={model}
        onModelChange={setPickedModel}
        mode={mode}
        onModeChange={setMode}
        onNewChat={current.reset}
        canStartNewChat={!current.empty}
      />
      {/* Both views stay mounted so each keeps its conversation, scroll position and draft. */}
      <DedicatedView
        hidden={mode !== 'dedicated'}
        setups={setups}
        exchanges={dedicated.exchanges}
        running={dedicated.busy}
        disabledReason={disabledReason('Battleground', battle.busy)}
        onSend={sendDedicated}
        onStop={dedicated.stop}
      />
      <BattlegroundView
        hidden={mode !== 'battleground'}
        models={ready?.models ?? []}
        defaultModel={defaultModel}
        setups={setups}
        rounds={battle.rounds}
        running={battle.busy}
        disabledReason={disabledReason('Dedicated', dedicated.busy)}
        onSend={battle.send}
        onStop={battle.stop}
        onNewComparison={battle.reset}
      />
    </div>
  )
}
