import { useCallback, useEffect, useRef } from 'react'
import type { ChatEvent, ChatRequest } from '../types'

/** Parses one server-sent event block: its `data:` lines hold one JSON event. */
function parseEvent(block: string): ChatEvent | undefined {
  const data = block
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trimStart())
    .join('\n')
  return data ? (JSON.parse(data) as ChatEvent) : undefined
}

async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<ChatEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    // Events end with a blank line; the last piece may still be incomplete.
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''
    for (const block of blocks) {
      const event = parseEvent(block)
      if (event) yield event
    }
  }
  const last = parseEvent(buffer)
  if (last) yield last
}

/**
 * Streams POST /api/chat. EventSource can't send a POST, so the body is read with fetch.
 * Each caller owns one stream at a time and can cancel it.
 */
export function useChatStream() {
  const controllerRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => controllerRef.current?.abort(), [])
  useEffect(() => cancel, [cancel])

  /** Streams one request, passing each event to onEvent. Resolves to false if it was cancelled. */
  const streamChat = useCallback(
    async (request: ChatRequest, onEvent: (event: ChatEvent) => void): Promise<boolean> => {
      const controller = new AbortController()
      controllerRef.current = controller
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
          signal: controller.signal,
        })
        if (!response.ok || !response.body) {
          throw new Error(`The server answered ${response.status} ${response.statusText}`)
        }
        for await (const event of readEvents(response.body)) onEvent(event)
        return true
      } catch (error) {
        if (controller.signal.aborted) return false
        onEvent({ error: error instanceof Error ? error.message : String(error) })
        return true
      }
    },
    [],
  )

  return { streamChat, cancel }
}
