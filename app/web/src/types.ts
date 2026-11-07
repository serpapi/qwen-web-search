// The backend contract: server.py and chat.py.

export type SetupId = 'none' | 'serpapi'

/** GET /api/config */
export interface Config {
  model: string
  setups: SetupId[]
}

export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

/** POST /api/chat request body. */
export interface ChatRequest {
  setup: SetupId
  message: string
  history: HistoryMessage[]
}

/** One search Qwen ran. */
export interface SearchStep {
  /** The engine Qwen chose: google, google_news, baidu or naver. */
  tool: string
  query: string
  /** The SerpApi engine that served it. Always the same as tool, even when the search failed. */
  engine: string
  format: 'markdown' | 'error'
  tokens: number
  seconds: number
}

/** Sent as soon as a search finishes. */
export interface SearchEvent {
  search: SearchStep
  /** The raw Markdown Qwen read, or "Search failed: <ExceptionType>". */
  payload: string
}

/** The final event of a successful request. */
export interface AnswerEvent {
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

export type ChatEvent = SearchEvent | AnswerEvent | ErrorEvent
