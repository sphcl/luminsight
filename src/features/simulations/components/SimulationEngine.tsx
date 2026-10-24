import type { SimulationSummary } from '@/features/simulations/engine/simulation'
import { useSimulation } from '@/features/simulations/hooks/useSimulation'
import type { SimulationDocument } from '@/types/simulation.types'
import { CallInterface } from './CallInterface'
import { ChatInterface } from './ChatInterface'
import { EmailInterface } from './EmailInterface'

interface SimulationEngineProps {
  simulation: SimulationDocument
  onFinish: (summary: SimulationSummary) => void
}

export function SimulationEngine({ simulation, onFinish }: SimulationEngineProps) {
  // Chat e ligação são conversa: a cena seguinte chega sozinha e o histórico fica na tela até o fim.
  const isConversation = simulation.format !== 'email'
  const session = useSimulation(simulation, { onFinish, autoAdvance: isConversation })
  if (!session.currentScene) return null
  if (session.isFinished && !isConversation) return null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-muted">
        {session.isFinished ? (
          'Conversa encerrada'
        ) : (
          <>
            Cena {session.sceneIndex + 1}
            {session.totalScenes !== null && ` de ${session.totalScenes}`}
          </>
        )}
      </p>
      {simulation.format === 'chat' && <ChatInterface simulation={simulation} session={session} />}
      {simulation.format === 'email' && (
        <EmailInterface simulation={simulation} session={session} />
      )}
      {simulation.format === 'call' && <CallInterface simulation={simulation} session={session} />}
    </div>
  )
}
