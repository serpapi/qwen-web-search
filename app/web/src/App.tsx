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
  // Null until the user picks a model, so the backend's default applies once the config arrives.
  const [pickedModel, setPickedModel] = useState<string | null>(null)
  const dedicated = useDedicatedChat()
  const battle = useBattleground()

  const ready = config.status === 'ready' ? config.config : undefined
  const setups = ready?.setups ?? SETUP_IDS
  const model = pickedModel ?? ready?.default_model ?? null
  // Both modes share one local Ollama, so only one request runs at a time.
  const busy = dedicated.busy || battle.busy
  const disabledReason = model === null ? 'No model available' : busy ? 'Waiting for the current response…' : undefined
  const current =
    mode === 'dedicated'
      ? { reset: dedicated.reset, empty: dedicated.exchanges.length === 0 }
      : { reset: battle.reset, empty: battle.rounds.length === 0 }

  // Sending is disabled while there's no model, so these checks only narrow the type.
  function sendDedicated(question: string, setup: SetupId) {
    if (model !== null) dedicated.send(question, setup, model)
  }
  function sendBattle(question: string, participants: SetupId[]) {
    if (model !== null) battle.send(question, participants, model)
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
        disabledReason={disabledReason}
        onSend={sendDedicated}
      />
      <BattlegroundView
        hidden={mode !== 'battleground'}
        setups={setups}
        rounds={battle.rounds}
        running={battle.busy}
        disabledReason={disabledReason}
        onSend={sendBattle}
      />
    </div>
  )
}
