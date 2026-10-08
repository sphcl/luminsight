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
  const session = useSimulation(simulation, { onFinish })
  if (!session.currentScene || session.isFinished) return null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-500">
        Cena {session.sceneIndex + 1} de {session.totalScenes}
      </p>
      {simulation.format === 'chat' && <ChatInterface simulation={simulation} session={session} />}
      {simulation.format === 'email' && (
        <EmailInterface simulation={simulation} session={session} />
      )}
      {simulation.format === 'call' && <CallInterface simulation={simulation} session={session} />}
    </div>
  )
}
