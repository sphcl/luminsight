import { Badge } from '@/components/ui'
import { buildTranscript } from '@/features/simulations/engine/simulation'
import { useConversationLog } from '@/features/simulations/hooks/useConversationLog'
import type { UseSimulationReturn } from '@/features/simulations/hooks/useSimulation'
import type { SimulationDocument } from '@/types/simulation.types'
import { ContactAvatar } from './ContactAvatar'
import { SceneDecision } from './SceneDecision'
import { SimulationFeedbackCard } from './SimulationFeedbackCard'
import { SimulationIndicator } from './SimulationIndicator'

interface ChatInterfaceProps {
  simulation: SimulationDocument
  session: UseSimulationReturn
}

export function ChatInterface({ simulation, session }: ChatInterfaceProps) {
  const { contact } = simulation
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
        aria-label={`Conversa simulada com ${contact.name}`}
        className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <ContactAvatar name={contact.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{contact.name}</p>
            <p className="truncate text-xs text-slate-500">{contact.address}</p>
          </div>
          <Badge variant="warning">Contato fictício</Badge>
        </header>

        {/* tabIndex 0 deixa rolar o histórico pelo teclado, e o log anuncia mensagem nova sem interromper. */}
        <ol
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label={`Conversa com ${contact.name}`}
          tabIndex={0}
          className="flex max-h-[28rem] min-h-64 flex-col gap-3 overflow-y-auto bg-slate-50 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
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
                <li key={entry.key} className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2 text-sm text-white">
                    <span className="sr-only">Você: </span>
                    {entry.text}
                  </p>
                </li>
              )
            }

            if (entry.message.sender === 'system') {
              return (
                <li key={entry.key} className="text-center text-xs italic text-slate-500">
                  {entry.message.content}
                </li>
              )
            }

            return (
              <li key={entry.key} className="flex items-end gap-2">
                <ContactAvatar name={contact.name} className="h-8 w-8 text-xs" />
                <div className="max-w-[80%]">
                  <p className="mb-1 text-xs font-medium text-slate-500">{contact.name}</p>
                  <p className="rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm text-slate-900 shadow-sm">
                    {entry.message.content}
                  </p>
                </div>
              </li>
            )
          })}
          {/* Fora da árvore de acessibilidade pra o log não anunciar "digitando" a cada mensagem. */}
          {isTyping && (
            <li
              aria-hidden="true"
              data-testid="typing-indicator"
              className="text-xs text-slate-500"
            >
              {contact.name} está digitando...
            </li>
          )}
        </ol>

        {!session.isFinished && (
          <div className="border-t border-slate-200 bg-white p-4">
            <SceneDecision session={session} variant="quick-reply" conversational />
          </div>
        )}
      </section>
      <SimulationIndicator />
    </>
  )
}
