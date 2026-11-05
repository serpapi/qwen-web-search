import type { SearchStep, SetupId } from './types'

export const SETUP_IDS: SetupId[] = ['none', 'searxng', 'serpapi-md', 'serpapi-json', 'cloud']

export const SETUP_INFO: Record<SetupId, { name: string; description: string }> = {
  none: { name: 'No search', description: 'Answers from its training data only' },
  searxng: { name: 'SearXNG', description: 'Self-hosted metasearch, raw JSON results' },
  'serpapi-md': { name: 'SerpApi · Markdown', description: 'Top 5 results as compact Markdown' },
  'serpapi-json': { name: 'SerpApi · JSON', description: 'Top 5 results as trimmed JSON' },
  cloud: { name: 'Qwen Cloud', description: 'Hosted Qwen with its built-in web search' },
}

const TOOL_NAMES: Record<string, string> = {
  google: 'Google',
  google_news: 'Google News',
  baidu: 'Baidu',
  naver: 'Naver',
  web_search: 'Web search',
}

export const FORMAT_LABELS: Record<SearchStep['format'], string> = {
  markdown: 'Markdown',
  json: 'JSON',
  hosted: 'Hosted',
  error: 'Failed',
}

/** The engine Qwen asked for, such as "Google News". */
export function toolName(tool: string): string {
  return TOOL_NAMES[tool] ?? tool
}

/** What actually served a search, such as "Naver via SerpApi" or "SearXNG: duckduckgo, google cse". */
export function servedBy(step: SearchStep, setup: SetupId): string {
  if (step.engine === 'qwen-cloud') return 'Qwen Cloud built-in search'
  const upstream = /^searxng \((.*)\)$/.exec(step.engine)
  if (upstream) return `SearXNG: ${upstream[1]}`
  // A failed search reports the chosen tool as its engine, so name the backend from the setup.
  if (setup === 'searxng') return 'SearXNG'
  return `${toolName(step.engine)} via SerpApi`
}
