import { useEffect, useState } from 'react'
import { buildTranscript } from '@/features/simulations/engine/simulation'
import { useConversationLog } from '@/features/simulations/hooks/useConversationLog'
import type { UseSimulationReturn } from '@/features/simulations/hooks/useSimulation'
import { formatCountdown } from '@/features/modules/hooks/useReadingTimer'
import type { SimulationDocument } from '@/types/simulation.types'
import { ContactAvatar } from './ContactAvatar'
import { SceneDecision } from './SceneDecision'
import { SimulationFeedbackCard } from './SimulationFeedbackCard'
import { SimulationIndicator } from './SimulationIndicator'

interface CallInterfaceProps {
  simulation: SimulationDocument
  session: UseSimulationReturn
}

const TICK_MS = 1000

function useCallDuration(): number {
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(startedAt)

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(intervalId)
  }, [])

  return Math.max(0, Math.floor((now - startedAt) / 1000))
}

export function CallInterface({ simulation, session }: CallInterfaceProps) {
  const { contact } = simulation
  const duration = useCallDuration()
  const transcript = buildTranscript(
    session.visitedScenes,
    session.visibleMessages,
    session.decisions,
    { withFeedback: true }
  )
  const { logRef, latestFeedbackRef } = useConversationLog(session, transcript.length)
  const feedbackEntries = transcript.filter((entry) => entry.kind === 'feedback')
  const lastFeedbackKey = feedbackEntries[feedbackEntries.length - 1]?.key
  const isTyping = !session.areMessagesComplete && !session.isFinished

  return (
    <>
      <section
        aria-label={`Ligação simulada com ${contact.name}`}
        className="flex flex-col gap-4 rounded-lg bg-slate-900 p-5 text-white shadow-sm"
      >
        <header className="flex flex-col items-center gap-2 text-center">
          <span className="rounded bg-amber-400 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-slate-900">
            Ligação simulada
          </span>
          <ContactAvatar name={contact.name} className="h-16 w-16 text-lg" />
          <p className="text-lg font-semibold">{contact.name}</p>
          <p className="text-sm text-slate-300">{contact.address}</p>
          <p className="text-sm text-slate-300">
            Chamada em andamento{' '}
            <time aria-label="Duração da chamada" className="font-mono tabular-nums text-white">
              {formatCountdown(duration)}
            </time>
          </p>
        </header>

        <ol
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Transcrição da ligação"
          tabIndex={0}
          className="flex max-h-80 min-h-48 flex-col gap-2 overflow-y-auto rounded-lg bg-slate-800 p-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {transcript.map((entry) => {
            if (entry.kind === 'feedback') {
              return (
                <SimulationFeedbackCard
                  key={entry.key}
                  ref={entry.key === lastFeedbackKey ? latestFeedbackRef : undefined}
                  isCorrect={entry.isCorrect}
                  feedback={entry.feedback}
                  correctOptionText={entry.correctOptionText}
                />
              )
            }

            if (entry.kind === 'reply') {
              return (
                <li key={entry.key} className="text-indigo-200">
                  <span className="font-semibold">Você:</span> {entry.text}
                </li>
              )
            }

            if (entry.message.sender === 'system') {
              return (
                <li key={entry.key} className="italic text-slate-400">
                  {entry.message.content}
                </li>
              )
            }

            return (
              <li key={entry.key} className="text-slate-100">
                <span className="font-semibold">{contact.name}:</span> {entry.message.content}
              </li>
            )
          })}
          {isTyping && (
            <li aria-hidden="true" data-testid="typing-indicator" className="text-slate-400">
              {contact.name} está falando...
            </li>
          )}
        </ol>

        {!session.isFinished && (
          <SceneDecision session={session} variant="response" conversational />
        )}
      </section>
      <SimulationIndicator />
    </>
  )
}
