import type { AnswerEvent, ChatEvent, HistoryMessage, SearchEvent, SetupId } from './types'

/**
 * What Qwen is doing while a turn streams. No event marks the start of a search, so searching starts when the first
 * search of a round lands, and lasts until Qwen thinks or writes again.
 */
export type Activity = 'thinking' | 'searching' | 'writing'

/** One assistant reply, built up from the stream events. */
export interface AssistantTurn {
  setup: SetupId
  /** The Ollama model asked to answer, kept so the UI can show it after the user switches models. */
  model: string
  /** stopped: the user stopped it while it ran. skipped: it was still queued when the user stopped its round. */
  status: 'queued' | 'streaming' | 'done' | 'error' | 'stopped' | 'skipped'
  /** The model Ollama is loading for this turn, until the first event from the model shows it's ready. */
  loadingModel?: string
  /** Drives the status line while the turn streams. */
  activity: Activity
  /** The reply text streamed so far. The answer event's full text replaces it. */
  draft: string
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
  return { setup, model, status: 'queued', activity: 'thinking', draft: '', searches: [] }
}

export function startTurn(turn: AssistantTurn): AssistantTurn {
  return { ...turn, status: 'streaming', startedAt: Date.now() }
}

export function applyEvent(turn: AssistantTurn, event: ChatEvent): AssistantTurn {
  if ('loading' in event) return { ...turn, loadingModel: event.loading }
  const loaded = { ...turn, loadingModel: undefined }
  if ('thinking' in event) return { ...loaded, activity: 'thinking' }
  if ('delta' in event) return { ...loaded, activity: 'writing', draft: turn.draft + event.delta }
  // The text streamed before a search was Qwen announcing it, not the answer.
  if ('search' in event) return { ...loaded, activity: 'searching', draft: '', searches: [...turn.searches, event] }
  if ('answer' in event) return { ...loaded, status: 'done', draft: '', result: event }
  return { ...loaded, status: 'error', error: event.error }
}

/** Fails a turn whose stream closed without an answer or an error. */
export function endTurn(turn: AssistantTurn): AssistantTurn {
  if (turn.status !== 'streaming') return turn
  return { ...turn, status: 'error', error: 'The response ended before an answer arrived.' }
}

/** Ends a turn the user stopped. A turn still waiting in its round is skipped, and a finished one stays as it is. */
export function stopTurn(turn: AssistantTurn): AssistantTurn {
  if (turn.status === 'streaming') return { ...turn, status: 'stopped' }
  if (turn.status === 'queued') return { ...turn, status: 'skipped' }
  return turn
}

export function isPending(turn: AssistantTurn | undefined): boolean {
  return turn?.status === 'queued' || turn?.status === 'streaming'
}

/**
 * Earlier questions and answers in the shape /api/chat expects. Turns without an answer (failed, stopped or not run)
 * are left out, so a corrected question isn't mixed up with the one the user abandoned.
 */
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
