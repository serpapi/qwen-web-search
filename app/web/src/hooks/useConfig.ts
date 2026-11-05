import { useEffect, useState } from 'react'
import type { Config } from '../types'

export type ConfigState = { status: 'loading' } | { status: 'ready'; config: Config } | { status: 'error' }

export function useConfig(): ConfigState {
  const [state, setState] = useState<ConfigState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/config', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<Config>
      })
      .then((config) => setState({ status: 'ready', config }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' })
      })
    return () => controller.abort()
  }, [])

  return state
}
