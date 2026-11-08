import { useState } from 'react'
import { columnLabel, type Column } from '../columns'
import type { Round } from '../conversation'
import { formatCount } from '../format'
import { buildPresets } from '../presets'
import type { ModelInfo, SetupId } from '../types'
import { BattleColumn } from './BattleColumn'
import { ColumnSetup } from './ColumnSetup'
import { ColumnSummary } from './ColumnSummary'
import { ComparisonTable } from './ComparisonTable'
import { Composer } from './Composer'
import { EmptyState } from './EmptyState'
import { ExamplePrompts } from './ExamplePrompts'

interface BattlegroundViewProps {
  hidden: boolean
  models: ModelInfo[]
  /** The backend's default model. Null until the config arrives, or when there's no model at all. */
  defaultModel: string | null
  setups: SetupId[]
  rounds: Round[]
  /** Why sending is disabled, such as a request running in either mode. Undefined when sending is allowed. */
  disabledReason: string | undefined
  onSend: (question: string, columns: Column[]) => void
  onNewComparison: () => void
}

/** "Running column 2 of 3: qwen3.8:27b · SerpApi · Google", or undefined when no column is running. */
function progress(round: Round): string | undefined {
  const index = round.replies.findIndex((turn) => turn.status === 'streaming')
  if (index === -1) return undefined
  const turn = round.replies[index]
  const position = `column ${index + 1} of ${round.replies.length}`
  return turn.loadingModel ? `Loading ${turn.loadingModel} for ${position}` : `Running ${position}: ${columnLabel(turn)}`
}

export function BattlegroundView({
  hidden,
  models,
  defaultModel,
  setups,
  rounds,
  disabledReason,
  onSend,
  onNewComparison,
}: BattlegroundViewProps) {
  const disabled = disabledReason !== undefined
  const presets = defaultModel === null ? [] : buildPresets(models.map((model) => model.name), defaultModel)
  // Null until the user picks columns, so the first preset applies once the config arrives.
  const [pickedColumns, setPickedColumns] = useState<Column[] | null>(null)
  const columns = pickedColumns ?? presets.at(0)?.columns ?? []
  // Each column keeps its own conversation, so the columns can't change until a new comparison starts.
  const locked = rounds.length > 0
  const latest = rounds.at(-1)
  const status =
    (latest && progress(latest)) ??
    (locked
      ? 'Columns stay the same for the whole comparison. Start a new comparison to change them.'
      : 'Columns run one after another, in this order, so they never compete for the local model.')

  function send(question: string) {
    onSend(question, columns)
  }

  return (
    <main hidden={hidden} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-3 border-b border-neutral-200 px-4 py-3 sm:px-6">
          {defaultModel !== null &&
            (locked ? (
              <ColumnSummary columns={columns} onNewComparison={onNewComparison} />
            ) : (
              <ColumnSetup
                columns={columns}
                presets={presets}
                models={models}
                defaultModel={defaultModel}
                setups={setups}
                onChange={setPickedColumns}
              />
            ))}
          <p aria-live="polite" className="text-sm text-neutral-600">
            {status}
          </p>
        </div>

        {latest ? (
          <div className="space-y-4 p-4 sm:px-6">
            <ComparisonTable round={latest} />
            <div className="overflow-x-auto pb-1">
              <div className="grid auto-cols-[minmax(20rem,1fr)] grid-flow-col items-start gap-3">
                {columns.map((column, index) => (
                  <BattleColumn key={index} column={column} index={index} rounds={rounds} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 sm:px-6">
            <EmptyState
              title="Compare models and search setups side by side"
              description="Each message goes to every column, one after another. Every column keeps its own conversation, so follow-up questions work in each one."
            >
              <ExamplePrompts onPick={send} disabled={disabled} />
            </EmptyState>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 bg-white px-4 pt-3 pb-2 sm:px-6">
        <Composer
          onSend={send}
          disabled={disabled}
          placeholder={disabledReason ?? `Ask ${formatCount(columns.length, 'column')}`}
        />
      </div>
    </main>
  )
}
