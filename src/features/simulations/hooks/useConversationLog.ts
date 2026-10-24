import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { UseSimulationReturn } from './useSimulation'

// Rolagem e foco da conversa: o log acompanha a mensagem mais nova e o foco nunca cai no body.
export function useConversationLog(session: UseSimulationReturn, entryCount: number) {
  const logRef = useRef<HTMLOListElement>(null)
  const latestFeedbackRef = useRef<HTMLLIElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const decisionCount = session.decisions.length
  const hasOptionsOnScreen =
    session.areMessagesComplete && !session.hasDecided && !session.isFinished

  useEffect(() => {
    const log = logRef.current
    if (!log) return
    if (prefersReducedMotion || typeof log.scrollTo !== 'function') {
      log.scrollTop = log.scrollHeight
      return
    }
    log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' })
  }, [entryCount, session.areMessagesComplete, prefersReducedMotion])

  // Se as opções novas já estão na tela (reduced motion), o próprio painel puxa o foco; senão ele fica no feedback.
  useEffect(() => {
    if (decisionCount === 0 || hasOptionsOnScreen) return
    latestFeedbackRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage a decisão nova
  }, [decisionCount])

  return { logRef, latestFeedbackRef }
}
