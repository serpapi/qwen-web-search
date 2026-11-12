import type { AnswerEvent, ChatEvent, HistoryMessage, SearchEvent, SetupId } from './types'

/**
 * What Qwen is doing while a turn streams. No event marks the start of a search, so searching starts when the first
 * search of a round lands, and lasts until Qwen thinks or writes again.
 */
export type Activity = 'thinking' | 'searching' | 'writing'

/**
 * A step before the answer. A draft is text Qwen wrote and then searched again instead of answering. It isn't the
 * answer, but the reader watched it stream, so it stays where it was instead of disappearing.
 */
export type ReplyItem = { kind: 'draft'; text: string } | { kind: 'search'; event: SearchEvent }

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
  /** Qwen's thinking over every round, one paragraph per round. */
  reasoning: string
  /** Drafts and searches, in the order they arrived. */
  items: ReplyItem[]
  /** The reply text streamed since the last search. The answer event's full text replaces it. */
  text: string
  /**
   * When the model started on this request, in epoch milliseconds. Drives the live elapsed timer. Undefined while the
   * model loads, because total_seconds leaves loading out too.
   */
  startedAt?: number
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
  return { setup, model, status: 'queued', activity: 'thinking', reasoning: '', items: [], text: '' }
}

export function startTurn(turn: AssistantTurn): AssistantTurn {
  return { ...turn, status: 'streaming', startedAt: Date.now() }
}

export function applyEvent(turn: AssistantTurn, event: ChatEvent): AssistantTurn {
  if ('loading' in event) return { ...turn, loadingModel: event.loading, startedAt: undefined }
  // Any other event means the model has loaded, so the timer starts now, as the server's total_seconds does.
  const ready = turn.loadingModel ? { ...turn, loadingModel: undefined, startedAt: Date.now() } : turn

  if ('thinking' in event) {
    const newRound = ready.activity !== 'thinking' && ready.reasoning !== ''
    const reasoning = ready.reasoning + (newRound ? '\n\n' : '') + event.thinking
    return { ...ready, activity: 'thinking', reasoning }
  }
  if ('delta' in event) return { ...ready, activity: 'writing', text: ready.text + event.delta }
  if ('search' in event) {
    const draft: ReplyItem[] = ready.text.trim() ? [{ kind: 'draft', text: ready.text }] : []
    return { ...ready, activity: 'searching', text: '', items: [...ready.items, ...draft, { kind: 'search', event }] }
  }
  if ('answer' in event) return { ...ready, status: 'done', text: '', result: event }
  return { ...ready, status: 'error', error: event.error }
}

export function searchesOf(turn: AssistantTurn): SearchEvent[] {
  return turn.items.flatMap((item) => (item.kind === 'search' ? [item.event] : []))
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
