import { useCallback, useState } from 'react'
import {
  applyEvent,
  buildHistory,
  endTurn,
  isPending,
  newId,
  queuedTurn,
  startTurn,
  type AssistantTurn,
  type Exchange,
} from '../conversation'
import type { SetupId } from '../types'
import { useChatStream } from './useChatStream'

/** One conversation where each message goes to the setup picked at the time. */
export function useDedicatedChat() {
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const { streamChat, cancel } = useChatStream()

  const updateReply = useCallback((id: string, update: (turn: AssistantTurn) => AssistantTurn) => {
    setExchanges((list) => list.map((exchange) => (exchange.id === id ? { ...exchange, reply: update(exchange.reply) } : exchange)))
  }, [])

  const send = useCallback(
    async (question: string, setup: SetupId) => {
      const id = newId()
      const history = buildHistory(exchanges)
      setExchanges((list) => [...list, { id, question, reply: startTurn(queuedTurn(setup)) }])
      const finished = await streamChat({ setup, message: question, history }, (event) =>
        updateReply(id, (turn) => applyEvent(turn, event)),
      )
      if (finished) updateReply(id, endTurn)
    },
    [exchanges, streamChat, updateReply],
  )

  const reset = useCallback(() => {
    cancel()
    setExchanges([])
  }, [cancel])

  return { exchanges, busy: isPending(exchanges.at(-1)?.reply), send, reset }
}
