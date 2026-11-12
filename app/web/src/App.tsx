import { useState } from 'react'
import { BattlegroundView } from './components/BattlegroundView'
import { DedicatedView } from './components/DedicatedView'
import { Header } from './components/Header'
import type { Mode } from './components/ModeToggle'
import { ModelWarning } from './components/ModelWarning'
import { StartupNotice } from './components/StartupNotice'
import { useBattleground } from './hooks/useBattleground'
import { useConfig } from './hooks/useConfig'
import { useDedicatedChat } from './hooks/useDedicatedChat'

export default function App() {
  const { state: config, checking, retry } = useConfig()
  const [mode, setMode] = useState<Mode>('dedicated')
  // The Dedicated-mode model. Null until the user picks one, so the backend's default applies once the config arrives.
  const [pickedModel, setPickedModel] = useState<string | null>(null)
  const dedicated = useDedicatedChat()
  const battle = useBattleground()

  const ready = config.status === 'ready' ? config.config : undefined
  // Null while the config loads, when it failed, or when there's no model at all. Then neither mode can chat.
  const defaultModel = ready?.default_model ?? null
  const current =
    mode === 'dedicated'
      ? { reset: dedicated.reset, empty: dedicated.exchanges.length === 0 }
      : { reset: battle.reset, empty: battle.rounds.length === 0 }

  /** Both modes share one local Ollama, so each waits while the other one answers. */
  function waitingFor(otherMode: string, otherModeBusy: boolean): string | undefined {
    return otherModeBusy ? `Waiting for the ${otherMode} response…` : undefined
  }

  return (
    <div className="flex h-dvh flex-col">
      <Header
        config={config}
        model={pickedModel ?? defaultModel}
        onModelChange={setPickedModel}
        mode={mode}
        onModeChange={setMode}
        onStartOver={current.reset}
        canStartOver={!current.empty}
      />
      <ModelWarning message={ready?.model_warning ?? null} />
      {ready && defaultModel !== null ? (
        // Both views stay mounted so each keeps its conversation, scroll position and draft.
        <>
          <DedicatedView
            hidden={mode !== 'dedicated'}
            setups={ready.setups}
            exchanges={dedicated.exchanges}
            running={dedicated.busy}
            disabledReason={waitingFor('Battleground', battle.busy)}
            onSend={(question, setup) => dedicated.send(question, setup, pickedModel ?? defaultModel)}
            onStop={dedicated.stop}
          />
          <BattlegroundView
            hidden={mode !== 'battleground'}
            models={ready.models}
            defaultModel={defaultModel}
            setups={ready.setups}
            rounds={battle.rounds}
            running={battle.busy}
            disabledReason={waitingFor('Dedicated', dedicated.busy)}
            onSend={battle.send}
            onStop={battle.stop}
          />
        </>
      ) : (
        <StartupNotice config={config} checking={checking} onRetry={retry} />
      )}
    </div>
  )
}
