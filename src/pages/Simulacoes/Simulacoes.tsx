import { Link } from 'react-router-dom'
import { Badge, Card, Skeleton } from '@/components/ui'
import { ROUTES, buildSimulationRoute } from '@/constants/routes'
import { ContentUnavailable } from '@/features/modules/components/ContentUnavailable'
import { formatMinutes } from '@/features/modules/labels'
import {
  useSimulations,
  type SimulationWithStatus,
} from '@/features/simulations/hooks/useSimulations'
import { FORMAT_LABELS, SIMULATION_STATUS_BADGES } from '@/features/simulations/labels'
import { cn } from '@/utils/helpers/classnames'

const SKELETON_CARDS = 4

export function Simulacoes() {
  const { data, isLoading, error } = useSimulations()

  if (error) {
    return (
      <ContentUnavailable
        title="Não foi possível carregar as simulações"
        description={error}
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar para o dashboard"
      />
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Simulações</h1>
        <p className="mt-1 text-slate-600">
          Cenários de golpe com contatos fictícios para treinar o que você aprendeu. Cada simulação
          libera junto com o módulo dela.
        </p>
      </header>

      {isLoading || !data ? (
        <ol className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando simulações">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <li key={index}>
              <Card className="flex flex-col gap-3">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </Card>
            </li>
          ))}
        </ol>
      ) : data.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">Nenhuma simulação publicada ainda.</p>
        </Card>
      ) : (
        <ol className="flex flex-col gap-4">
          {data.map((item) => (
            <li key={item.simulation.id}>
              <SimulationCard item={item} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function SimulationCard({ item }: { item: SimulationWithStatus }) {
  const { simulation, module, status } = item
  const isLocked = status === 'locked'
  // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
  const statusBadge = SIMULATION_STATUS_BADGES[status]

  const content = (
    <Card
      interactive={!isLocked}
      className={cn('flex flex-col gap-3', isLocked && 'cursor-not-allowed opacity-60')}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        <Badge>{FORMAT_LABELS[simulation.format]}</Badge>
        <Badge>{formatMinutes(simulation.estimatedMinutes)}</Badge>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{simulation.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{simulation.description}</p>
      </div>
      <p className="text-sm text-slate-500">
        {isLocked
          ? `Libera quando o módulo "${module.title}" for desbloqueado.`
          : `Módulo: ${module.title}`}
      </p>
    </Card>
  )

  if (isLocked) {
    return (
      <div aria-disabled="true" data-testid={`simulation-card-${simulation.id}`}>
        {content}
      </div>
    )
  }

  return (
    <Link
      to={buildSimulationRoute(simulation.id)}
      data-testid={`simulation-card-${simulation.id}`}
      className="block rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {content}
    </Link>
  )
}
