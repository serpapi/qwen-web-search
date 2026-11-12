import { useCallback, useEffect, useState } from 'react'
import { httpError, isProxyError } from '../api'
import type { Config, ConfigUnavailable } from '../types'

/** Why the config couldn't be loaded. Each one has its own fix. */
export type ConfigProblem =
  | { kind: 'server-unreachable' }
  | { kind: 'ollama-down'; detail: string }
  | { kind: 'other'; message: string }

export type ConfigState =
  | { status: 'loading' }
  | { status: 'ready'; config: Config }
  | { status: 'error'; problem: ConfigProblem }

async function fetchConfig(signal: AbortSignal): Promise<ConfigState> {
  let response: Response
  try {
    response = await fetch('/api/config', { signal })
  } catch {
    return { status: 'error', problem: { kind: 'server-unreachable' } }
  }
  if (isProxyError(response)) return { status: 'error', problem: { kind: 'server-unreachable' } }
  if (response.status === 503) {
    const { detail } = (await response.json()) as ConfigUnavailable
    return { status: 'error', problem: { kind: 'ollama-down', detail } }
  }
  if (!response.ok) return { status: 'error', problem: { kind: 'other', message: httpError(response) } }
  return { status: 'ready', config: (await response.json()) as Config }
}

/** Loads GET /api/config once, and again on retry. checking is true while a request runs. */
export function useConfig() {
  const [state, setState] = useState<ConfigState>({ status: 'loading' })
  const [checking, setChecking] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchConfig(controller.signal)
      .catch((error: unknown): ConfigState => ({ status: 'error', problem: { kind: 'other', message: String(error) } }))
      .then((next) => {
        if (controller.signal.aborted) return
        setState(next)
        setChecking(false)
      })
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setChecking(true)
    setAttempt((count) => count + 1)
  }, [])

  return { state, checking, retry }
}
