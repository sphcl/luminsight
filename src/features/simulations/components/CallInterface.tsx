import { useEffect, useState } from 'react'
import { buildTranscript } from '@/features/simulations/engine/simulation'
import type { UseSimulationReturn } from '@/features/simulations/hooks/useSimulation'
import { formatCountdown } from '@/features/modules/hooks/useReadingTimer'
import type { SimulationDocument } from '@/types/simulation.types'
import { ContactAvatar } from './ContactAvatar'
import { SceneDecision } from './SceneDecision'
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
    simulation.scenes,
    session.sceneIndex,
    session.visibleMessages,
    session.decisions
  )

  return (
    <>
      <section
        aria-label={`Ligação simulada com ${contact.name}`}
        className="flex flex-col gap-4 rounded-card bg-slate-900 p-5 text-white shadow-card"
      >
        <header className="flex flex-col items-center gap-2 text-center">
          <span className="rounded bg-warning-500 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white">
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
          role="log"
          aria-live="polite"
          aria-label="Transcrição da ligação"
          className="flex min-h-48 flex-col gap-2 rounded-lg bg-slate-800 p-4 text-sm"
        >
          {transcript.map((entry) => {
            if (entry.kind === 'reply') {
              return (
                <li key={entry.key} className="text-primary-200">
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
          {!session.areMessagesComplete && <li className="text-slate-400">...</li>}
        </ol>

        <SceneDecision session={session} variant="response" />
      </section>
      <SimulationIndicator />
    </>
  )
}
