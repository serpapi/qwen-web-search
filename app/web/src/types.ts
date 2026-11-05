// The backend contract: server.py, chat.py and cloud.py.

export type SetupId = 'none' | 'searxng' | 'serpapi-md' | 'serpapi-json' | 'cloud'

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

/** One search Qwen ran. Hosted (Qwen Cloud) searches have no tokens or seconds. */
export interface SearchStep {
  /** The engine Qwen chose: google, google_news, baidu or naver (web_search on Qwen Cloud). */
  tool: string
  query: string
  /** What served it: a SerpApi engine, "searxng (<upstream engines>)" or "qwen-cloud". */
  engine: string
  format: 'markdown' | 'json' | 'hosted' | 'error'
  tokens?: number
  seconds?: number
}

/** Sent as soon as a search finishes. */
export interface SearchEvent {
  search: SearchStep
  /** The raw Markdown or JSON Qwen read. Hosted searches don't expose it. */
  payload?: string
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
