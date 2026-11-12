import type { SearchStep, SetupId } from './types'

export const SETUP_INFO: Record<SetupId, { name: string; description: string }> = {
  none: { name: 'No search', description: 'Answers from its training data only' },
  'serpapi-google': { name: 'SerpApi · Google', description: 'Google only, top 5 results' },
  serpapi: { name: 'SerpApi · Multiple engines', description: 'Qwen picks Google, Google News, Baidu or Naver' },
}

const TOOL_NAMES: Record<string, string> = {
  google: 'Google',
  google_news: 'Google News',
  baidu: 'Baidu',
  naver: 'Naver',
}

/** The engine Qwen asked for, such as "Google News". */
export function toolName(tool: string): string {
  return TOOL_NAMES[tool] ?? tool
}

/** What served a search, such as "Naver via SerpApi". */
export function servedBy(step: SearchStep): string {
  return `${toolName(step.engine)} via SerpApi`
}
