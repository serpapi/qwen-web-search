import { useState } from 'react'
import { BattlegroundView } from './components/BattlegroundView'
import { DedicatedView } from './components/DedicatedView'
import { Header } from './components/Header'
import type { Mode } from './components/ModeToggle'
import { useBattleground } from './hooks/useBattleground'
import { useConfig } from './hooks/useConfig'
import { useDedicatedChat } from './hooks/useDedicatedChat'
import { SETUP_IDS } from './setups'

export default function App() {
  const config = useConfig()
  const [mode, setMode] = useState<Mode>('dedicated')
  const dedicated = useDedicatedChat()
  const battle = useBattleground()

  const setups = config.status === 'ready' ? config.config.setups : SETUP_IDS
  // Both modes share one local model, so only one request runs at a time.
  const busy = dedicated.busy || battle.busy
  const current =
    mode === 'dedicated'
      ? { reset: dedicated.reset, empty: dedicated.exchanges.length === 0 }
      : { reset: battle.reset, empty: battle.rounds.length === 0 }

  return (
    <div className="flex h-dvh flex-col">
      <Header
        config={config}
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
        disabled={busy}
        onSend={dedicated.send}
      />
      <BattlegroundView
        hidden={mode !== 'battleground'}
        setups={setups}
        rounds={battle.rounds}
        running={battle.busy}
        disabled={busy}
        onSend={battle.send}
      />
    </div>
  )
}
