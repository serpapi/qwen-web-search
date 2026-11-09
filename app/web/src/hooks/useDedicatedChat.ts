import { useCallback, useState } from 'react'
import {
  applyEvent,
  buildHistory,
  endTurn,
  isPending,
  newId,
  queuedTurn,
  startTurn,
  stopTurn,
  type AssistantTurn,
  type Exchange,
} from '../conversation'
import type { SetupId } from '../types'
import { useChatStream } from './useChatStream'

/** One conversation where each message goes to the setup and model picked at the time. */
export function useDedicatedChat() {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const { streamChat, cancel } = useChatStream()

  const updateReply = useCallback((id: string, update: (turn: AssistantTurn) => AssistantTurn) => {
    setExchanges((list) => list.map((exchange) => (exchange.id === id ? { ...exchange, reply: update(exchange.reply) } : exchange)))
  }, [])

  const send = useCallback(
    async (question: string, setup: SetupId, model: string) => {
      const id = newId()
      const history = buildHistory(exchanges)
      setExchanges((list) => [...list, { id, question, reply: startTurn(queuedTurn(setup, model)) }])
      const finished = await streamChat({ setup, model, message: question, history }, (events) =>
        updateReply(id, (turn) => events.reduce(applyEvent, turn)),
      )
      updateReply(id, finished ? endTurn : stopTurn)
    },
    [exchanges, streamChat, updateReply],
  )

  const reset = useCallback(() => {
    cancel()
    setExchanges([])
  }, [cancel])

  return { exchanges, busy: isPending(exchanges.at(-1)?.reply), send, stop: cancel, reset }
}
