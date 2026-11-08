import type { AnswerEvent, ChatEvent, HistoryMessage, SearchEvent, SetupId } from './types'

/** One assistant reply, built up from the stream events. */
export interface AssistantTurn {
  setup: SetupId
  /** The Ollama model asked to answer, kept so the UI can show it after the user switches models. */
  model: string
  status: 'queued' | 'streaming' | 'done' | 'error'
  /** The model Ollama is loading for this turn, until the first search or answer shows it's ready. */
  loadingModel?: string
  /** When the request started, in epoch milliseconds. Drives the live elapsed timer. */
  startedAt?: number
  searches: SearchEvent[]
  result?: AnswerEvent
  error?: string
}

/** A user message and its reply (Dedicated mode). */
export interface Exchange {
  id: string
  question: string
  reply: AssistantTurn
}

/** A user message sent to every column (Battleground mode). */
export interface Round {
  id: string
  question: string
  /** One reply per column, in column order. A column is known by its position, since columns can repeat. */
  replies: AssistantTurn[]
}

let lastId = 0

export function newId(): string {
  lastId += 1
  return String(lastId)
}

export function queuedTurn(setup: SetupId, model: string): AssistantTurn {
  return { setup, model, status: 'queued', searches: [] }
}

export function startTurn(turn: AssistantTurn): AssistantTurn {
  return { ...turn, status: 'streaming', startedAt: Date.now() }
}

export function applyEvent(turn: AssistantTurn, event: ChatEvent): AssistantTurn {
  if ('loading' in event) return { ...turn, loadingModel: event.loading }
  const loaded = { ...turn, loadingModel: undefined }
  if ('search' in event) return { ...loaded, searches: [...turn.searches, event] }
  if ('answer' in event) return { ...loaded, status: 'done', result: event }
  return { ...loaded, status: 'error', error: event.error }
}

/** Fails a turn whose stream closed without an answer or an error. */
export function endTurn(turn: AssistantTurn): AssistantTurn {
  if (turn.status !== 'streaming') return turn
  return { ...turn, status: 'error', error: 'The response ended before an answer arrived.' }
}

export function isPending(turn: AssistantTurn | undefined): boolean {
  return turn?.status === 'queued' || turn?.status === 'streaming'
}

/** Earlier questions and answers in the shape /api/chat expects. Turns without an answer are left out. */
export function buildHistory(turns: { question: string; reply?: AssistantTurn }[]): HistoryMessage[] {
  return turns.flatMap(({ question, reply }): HistoryMessage[] =>
    reply?.result
      ? [
          { role: 'user', content: question },
          { role: 'assistant', content: reply.result.answer },
        ]
      : [],
  )
}
