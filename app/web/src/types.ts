// The backend contract: server.py and chat.py.

export type SetupId = 'none' | 'serpapi-google' | 'serpapi'

/** A Qwen model installed in Ollama that supports tool calling. */
export interface ModelInfo {
  name: string
  /** The parameter count Ollama reports, such as "27.3B". */
  parameters: string
}

/** GET /api/config */
export interface Config {
  /** Biggest first. Empty when no Qwen model with tool support is installed. */
  models: ModelInfo[]
  /**
   * LOCAL_MODEL from .env, otherwise the biggest model. It can name a model that isn't in models.
   * Null when LOCAL_MODEL isn't set and there's no Qwen model.
   */
  default_model: string | null
  setups: SetupId[]
}

export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

/** POST /api/chat request body. */
export interface ChatRequest {
  setup: SetupId
  /** The Ollama model that answers, such as "qwen3.8:27b". */
  model: string
  message: string
  history: HistoryMessage[]
}

/** One search Qwen ran. */
export interface SearchStep {
  /**
   * The SerpApi engine Qwen chose: google, google_news, baidu or naver. Always google for serpapi-google.
   * A plain string, because Ollama doesn't enforce the engine enum.
   */
  tool: string
  query: string
  /**
   * How recent Qwen asked the results to be: day, week, month or year, or null when it didn't ask.
   * Only Google applies it. A plain string, because Ollama doesn't enforce the enum.
   */
  recency: string | null
  /** The SerpApi engine that served it. Always the same as tool, even when the search failed. */
  engine: string
  format: 'markdown' | 'error'
  tokens: number
  seconds: number
}

/**
 * Sent first when the requested model isn't in memory yet. The server loads it before it starts timing,
 * so total_seconds never includes loading.
 */
export interface LoadingEvent {
  /** The model being loaded. */
  loading: string
}

/** A piece of Qwen's reasoning, streamed before each search or answer. Many per request. */
export interface ThinkingEvent {
  thinking: string
}

/**
 * A piece of Qwen's reply text, streamed token by token. Usually the answer, but when a search event follows, the text
 * streamed before it wasn't: Qwen sometimes writes a line before it searches.
 */
export interface DeltaEvent {
  delta: string
}

/** Sent as soon as a search finishes. */
export interface SearchEvent {
  search: SearchStep
  /** The raw Markdown Qwen read, or "Search failed: <ExceptionType>". */
  payload: string
}

/** The final event of a successful request. */
export interface AnswerEvent {
  /** The full reply, which replaces the text streamed in delta events. */
  answer: string
  searches: SearchStep[]
  /** Summed over every tool round, so each extra round adds the whole conversation again. */
  prompt_tokens: number
  completion_tokens: number
  total_seconds: number
}

export interface ErrorEvent {
  error: string
}

export type ChatEvent = LoadingEvent | ThinkingEvent | DeltaEvent | SearchEvent | AnswerEvent | ErrorEvent
