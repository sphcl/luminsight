import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge, Button, Card, Skeleton } from '@/components/ui'
import { textLinkClass } from '@/components/ui/linkStyles'
import { cn } from '@/utils/helpers/classnames'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { ContentUnavailable } from '@/features/modules/components/ContentUnavailable'
import { ModuleCompleteNotice } from '@/features/modules/components/ModuleCompleteNotice'
import { isModuleComplete } from '@/features/modules/engine/trail'
import { formatMinutes } from '@/features/modules/labels'
import { SimulationEngine } from '@/features/simulations/components/SimulationEngine'
import { SimulationIndicator } from '@/features/simulations/components/SimulationIndicator'
import {
  SimulationResult,
  type SaveStatus,
} from '@/features/simulations/components/SimulationResult'
import {
  getDecisionCountRange,
  getFirstName,
  personalizeSimulation,
  type SimulationSummary,
} from '@/features/simulations/engine/simulation'
import { useSimulationAccess } from '@/features/simulations/hooks/useSimulations'
import { FORMAT_LABELS } from '@/features/simulations/labels'
import { markModuleCompleted, markSimulationCompleted } from '@/services/progress.service'
import { mapFirestoreError } from '@/utils/security/errors'
import type { ModuleWithId } from '@/types/module.types'
import type { ProgressDocument } from '@/types/progress.types'
import type { SimulationDocument } from '@/types/simulation.types'
import { useDocumentTitle } from '@/lib/router/useDocumentTitle'
import { parseRouteId } from '@/utils/security/route-params'

export function Simulacao() {
  const simulationId = parseRouteId(useParams<{ simulationId: string }>().simulationId)
  const { user, userDocument } = useAuth()
  const state = useSimulationAccess(simulationId)

  switch (state.status) {
    case 'loading':
      return <SimulationSkeleton />

    case 'error':
      return (
        <ContentUnavailable
          title="Não foi possível carregar a simulação"
          description={state.message}
          backTo={ROUTES.SIMULACOES}
          backLabel="Voltar às simulações"
        />
      )

    case 'not_found':
      return (
        <ContentUnavailable
          title="Simulação não encontrada"
          description="Essa simulação não existe ou não está disponível."
          backTo={ROUTES.SIMULACOES}
          backLabel="Voltar às simulações"
        />
      )

    case 'locked':
      return <Navigate to={ROUTES.SIMULACOES} replace />

    case 'ready':
      if (!user) return <SimulationSkeleton />

      return (
        <SimulationSession
          key={state.simulation.id}
          uid={user.uid}
          simulation={state.simulation}
          recipientName={getFirstName(userDocument?.displayName ?? user.displayName)}
          module={state.module}
          progress={state.progress}
        />
      )
  }
}

interface SimulationSessionProps {
  uid: string
  simulation: SimulationDocument
  recipientName: string
  module: ModuleWithId
  progress: ProgressDocument | undefined
}

type Phase = 'intro' | 'running' | 'result'

function SimulationSession({
  uid,
  simulation: rawSimulation,
  recipientName,
  module,
  progress,
}: SimulationSessionProps) {
  useDocumentTitle(rawSimulation.title)
  // Memo pra engine não receber cenas novas a cada render e reiniciar o timer das mensagens.
  const simulation = useMemo(
    () => personalizeSimulation(rawSimulation, recipientName),
    [rawSimulation, recipientName]
  )
  const [phase, setPhase] = useState<Phase>('intro')
  const [attempt, setAttempt] = useState(0)
  const [summary, setSummary] = useState<SimulationSummary | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saving')
  const [isModuleMarked, setIsModuleMarked] = useState((progress?.completedAt ?? null) !== null)
  const [justCompletedModule, setJustCompletedModule] = useState(false)

  async function persistCompletion() {
    setSaveStatus('saving')
    try {
      await markSimulationCompleted(uid, module.id)

      // Só marco uma vez: refazer depois de concluído não pode sobrescrever o completedAt original.
      if (progress && !isModuleMarked) {
        const nextProgress: ProgressDocument = { ...progress, simulationCompleted: true }
        if (isModuleComplete(module, nextProgress)) {
          await markModuleCompleted(uid, module.id)
          setIsModuleMarked(true)
          setJustCompletedModule(true)
        }
      }

      setSaveStatus('saved')
    } catch (caughtError) {
      mapFirestoreError(caughtError)
      setSaveStatus('error')
    }
  }

  function handleFinish(result: SimulationSummary) {
    setSummary(result)
    setPhase('result')
    void persistCompletion()
  }

  function handleRetry() {
    setSummary(null)
    setJustCompletedModule(false)
    setAttempt((current) => current + 1)
    setPhase('running')
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
      <Link to={ROUTES.SIMULACOES} className={cn(textLinkClass, 'self-start')}>
        Voltar às simulações
      </Link>

      {phase === 'intro' && (
        <SimulationIntro
          simulation={simulation}
          module={module}
          onStart={() => setPhase('running')}
        />
      )}

      {/* Na conversa o histórico fica na tela no fim, e o resultado aparece embaixo dele. */}
      {(phase === 'running' || (phase === 'result' && simulation.format !== 'email')) && (
        <SimulationEngine key={attempt} simulation={simulation} onFinish={handleFinish} />
      )}

      {phase === 'result' && justCompletedModule && (
        <ModuleCompleteNotice moduleTitle={module.title} />
      )}

      {phase === 'result' && summary && (
        <SimulationResult
          showIndicator={simulation.format === 'email'}
          summary={summary}
          scenes={simulation.scenes}
          conclusion={simulation.conclusion}
          saveStatus={saveStatus}
          backTo={ROUTES.SIMULACOES}
          onRetry={handleRetry}
        />
      )}
    </div>
  )
}

interface SimulationIntroProps {
  simulation: SimulationDocument
  module: ModuleWithId
  onStart: () => void
}

function SimulationIntro({ simulation, module, onStart }: SimulationIntroProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant="warning">Simulação</Badge>
        <Badge>{FORMAT_LABELS[simulation.format]}</Badge>
        <Badge>{formatMinutes(simulation.estimatedMinutes)}</Badge>
      </div>
      <div>
        <h1 className="page-title">{simulation.title}</h1>
        <p className="mt-1 text-sm text-ink-muted">Módulo: {module.title}</p>
        <p className="mt-2 whitespace-pre-line text-ink-soft">{simulation.description}</p>
      </div>
      <div className="rounded-card bg-warning-soft p-4 text-sm text-ink">
        <p className="font-semibold">Isto é uma simulação.</p>
        <p className="mt-1">
          As mensagens imitam um golpe de propósito, para você treinar. Pessoas, empresas, telefones
          e endereços são fictícios, e nada do que você responder sai desta tela. Nenhuma
          instituição real entra em contato pelo LumInsight.
        </p>
      </div>
      <ul className="flex flex-col gap-1 text-sm text-ink-soft">
        <li>{formatDecisionCount(getDecisionCountRange(simulation.scenes))}</li>
        <li>Depois de escolher uma opção, não dá para alterá-la.</li>
        <li>Cada decisão mostra o sinal que entregava o golpe.</li>
      </ul>
      <Button className="self-start" onClick={onStart}>
        Começar simulação
      </Button>
      <SimulationIndicator />
    </Card>
  )
}

function formatDecisionCount({ min, max }: { min: number; max: number }): string {
  if (min === max) return `${max} ${max === 1 ? 'decisão' : 'decisões'}`
  return `De ${min} a ${max} decisões, dependendo das suas escolhas`
}

function SimulationSkeleton() {
  return (
    <div
      className="mx-auto flex max-w-3xl flex-col gap-6"
      aria-busy="true"
      aria-label="Carregando simulação"
    >
      <Card className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-11 w-44" />
      </Card>
    </div>
  )
}
