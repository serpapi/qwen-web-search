import { useCallback, useState } from 'react'
import type { Column } from '../columns'
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
  type Round,
} from '../conversation'
import { useChatStream } from './useChatStream'

/** Sends each message to every column, one after another. Every column keeps its own history. */
export function useBattleground() {
  const [rounds, setRounds] = useState<Round[]>([])
  const { streamChat, cancel } = useChatStream()

  const updateRound = useCallback((roundId: string, update: (round: Round) => Round) => {
    setRounds((list) => list.map((round) => (round.id === roundId ? update(round) : round)))
  }, [])

  const updateReply = useCallback(
    (roundId: string, index: number, update: (turn: AssistantTurn) => AssistantTurn) => {
      updateRound(roundId, (round) => ({ ...round, replies: round.replies.with(index, update(round.replies[index])) }))
    },
    [updateRound],
  )

  /** Columns must stay the same for the whole conversation, because replies are matched by position. */
  const send = useCallback(
    async (question: string, columns: Column[]) => {
      const id = newId()
      const replies = columns.map((column) => queuedTurn(column.setup, column.model))
      setRounds((list) => [...list, { id, question, replies }])

      // One column at a time: they share one local Ollama, so parallel runs would skew the timings.
      for (const [index, { setup, model }] of columns.entries()) {
        const history = buildHistory(rounds.map((round) => ({ question: round.question, reply: round.replies[index] })))
        updateReply(id, index, startTurn)
        const finished = await streamChat({ setup, model, message: question, history }, (events) =>
          updateReply(id, index, (turn) => events.reduce(applyEvent, turn)),
        )
        if (!finished) {
          // Stopped: this column ends here, and the columns still queued never start.
          updateRound(id, (round) => ({ ...round, replies: round.replies.map(stopTurn) }))
          return
        }
        updateReply(id, index, endTurn)
      }
    },
    [rounds, streamChat, updateRound, updateReply],
  )

  const reset = useCallback(() => {
    cancel()
    setRounds([])
  }, [cancel])

  const busy = rounds.at(-1)?.replies.some(isPending) ?? false

  return { rounds, busy, send, stop: cancel, reset }
}
