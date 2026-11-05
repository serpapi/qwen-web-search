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
  type Round,
} from '../conversation'
import type { SetupId } from '../types'
import { useChatStream } from './useChatStream'

/** Sends each message to several setups. Every setup keeps its own history. */
export function useBattleground() {
  const [rounds, setRounds] = useState<Round[]>([])
  const { streamChat, cancel } = useChatStream()

  const updateReply = useCallback(
    (roundId: string, setup: SetupId, update: (turn: AssistantTurn) => AssistantTurn) => {
      setRounds((list) =>
        list.map((round) => {
          const reply = round.replies[setup]
          if (round.id !== roundId || !reply) return round
          return { ...round, replies: { ...round.replies, [setup]: update(reply) } }
        }),
      )
    },
    [],
  )

  const send = useCallback(
    async (question: string, setups: SetupId[]) => {
      const id = newId()
      const replies = Object.fromEntries(setups.map((setup) => [setup, queuedTurn(setup)]))
      setRounds((list) => [...list, { id, question, replies }])

      // One setup at a time: they share one local model, so parallel runs would skew the timings.
      for (const setup of setups) {
        const history = buildHistory(rounds.map((round) => ({ question: round.question, reply: round.replies[setup] })))
        updateReply(id, setup, startTurn)
        const finished = await streamChat({ setup, message: question, history }, (event) =>
          updateReply(id, setup, (turn) => applyEvent(turn, event)),
        )
        if (!finished) return
        updateReply(id, setup, endTurn)
      }
    },
    [rounds, streamChat, updateReply],
  )

  const reset = useCallback(() => {
    cancel()
    setRounds([])
  }, [cancel])

  const latest = rounds.at(-1)
  const busy = latest ? Object.values(latest.replies).some(isPending) : false

  return { rounds, busy, send, reset }
}
