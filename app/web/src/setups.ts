import type { SearchStep, SetupId } from './types'

export const SETUP_IDS: SetupId[] = ['none', 'serpapi-md', 'serpapi-json']

export const SETUP_INFO: Record<SetupId, { name: string; description: string }> = {
  none: { name: 'No search', description: 'Answers from its training data only' },
  'serpapi-md': { name: 'SerpApi · Markdown', description: 'Top 5 results as compact Markdown' },
  'serpapi-json': { name: 'SerpApi · JSON', description: 'Top 5 results as trimmed JSON' },
}

const TOOL_NAMES: Record<string, string> = {
  google: 'Google',
  google_news: 'Google News',
  baidu: 'Baidu',
  naver: 'Naver',
}

export const FORMAT_LABELS: Record<SearchStep['format'], string> = {
  markdown: 'Markdown',
  json: 'JSON',
  error: 'Failed',
}

/** The engine Qwen asked for, such as "Google News". */
export function toolName(tool: string): string {
  return TOOL_NAMES[tool] ?? tool
}

/** What served a search, such as "Naver via SerpApi". */
export function servedBy(step: SearchStep): string {
  return `${toolName(step.engine)} via SerpApi`
}
