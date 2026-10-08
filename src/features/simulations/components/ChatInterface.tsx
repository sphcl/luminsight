import { Badge } from '@/components/ui'
import { buildTranscript } from '@/features/simulations/engine/simulation'
import type { UseSimulationReturn } from '@/features/simulations/hooks/useSimulation'
import type { SimulationDocument } from '@/types/simulation.types'
import { ContactAvatar } from './ContactAvatar'
import { SceneDecision } from './SceneDecision'
import { SimulationIndicator } from './SimulationIndicator'

interface ChatInterfaceProps {
  simulation: SimulationDocument
  session: UseSimulationReturn
}

export function ChatInterface({ simulation, session }: ChatInterfaceProps) {
  const { contact } = simulation
  const transcript = buildTranscript(
    simulation.scenes,
    session.sceneIndex,
    session.visibleMessages,
    session.decisions
  )

  return (
    <>
      <section
        aria-label={`Conversa simulada com ${contact.name}`}
        className="flex flex-col overflow-hidden rounded-card border border-surface-border bg-white shadow-card"
      >
        <header className="flex items-center gap-3 border-b border-surface-border bg-surface-muted px-4 py-3">
          <ContactAvatar name={contact.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900">{contact.name}</p>
            <p className="truncate text-xs text-slate-500">{contact.address}</p>
          </div>
          <Badge variant="warning">Contato fictício</Badge>
        </header>

        <ol role="log" aria-live="polite" className="flex min-h-64 flex-col gap-3 bg-slate-50 p-4">
          {transcript.map((entry) => {
            if (entry.kind === 'reply') {
              return (
                <li key={entry.key} className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary-600 px-4 py-2 text-sm text-white">
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
                  <p className="rounded-2xl rounded-bl-sm bg-white px-4 py-2 text-sm text-slate-900 shadow-card">
                    {entry.message.content}
                  </p>
                </div>
              </li>
            )
          })}
          {!session.areMessagesComplete && (
            <li className="text-xs text-slate-500" aria-label={`${contact.name} está digitando`}>
              digitando...
            </li>
          )}
        </ol>

        <div className="border-t border-surface-border bg-white p-4">
          <SceneDecision session={session} variant="quick-reply" />
        </div>
      </section>
      <SimulationIndicator />
    </>
  )
}
