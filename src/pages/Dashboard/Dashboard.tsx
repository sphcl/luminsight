import { Link } from 'react-router-dom'
import { Badge, Card, ProgressBar, Skeleton } from '@/components/ui'
import { ROUTES, buildModuleRoute } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { ContentUnavailable } from '@/features/modules/components/ContentUnavailable'
import { getStatusBadge } from '@/features/modules/labels'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import type {
  DashboardModule,
  DashboardSummary,
  NextStep,
} from '@/features/dashboard/engine/dashboard'
import { cn } from '@/utils/helpers/classnames'

const primaryLinkClass =
  'inline-flex h-11 items-center justify-center self-start rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700'

export function Dashboard() {
  const { user, userDocument } = useAuth()
  const { data, isLoading, error } = useDashboard()
  const displayName = userDocument?.displayName ?? user?.displayName ?? 'Usuário'

  if (error) {
    return (
      <ContentUnavailable
        title="Não foi possível carregar o dashboard"
        description={error}
        backTo={ROUTES.TRILHA}
        backLabel="Ir para a trilha"
      />
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Olá, {displayName}</h1>
        <p className="mt-1 text-slate-600">Aqui está o resumo do seu aprendizado.</p>
      </header>

      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : data.summary.hasStarted ? (
        <StartedView summary={data.summary} continueRoute={data.continueRoute} />
      ) : (
        <WelcomeView modules={data.summary.modules} />
      )}
    </div>
  )
}

function WelcomeView({ modules }: { modules: DashboardModule[] }) {
  const firstModule = modules[0]?.module

  return (
    <>
      <Card className="flex flex-col gap-4" data-testid="dashboard-welcome">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Vamos começar?</h2>
          <p className="mt-1 text-sm text-slate-600">
            {firstModule
              ? `A trilha começa pelo módulo 1, ${firstModule.title}. Cada módulo libera o próximo quando você termina.`
              : 'Nenhum módulo publicado ainda. Volte daqui a pouco.'}
          </p>
        </div>
        {firstModule && (
          <Link to={buildModuleRoute(firstModule.id)} className={primaryLinkClass}>
            Começar pelo módulo 1
          </Link>
        )}
      </Card>
      {modules.length > 0 && <ModuleList modules={modules} />}
    </>
  )
}

function StartedView({
  summary,
  continueRoute,
}: {
  summary: DashboardSummary
  continueRoute: string
}) {
  const continueCopy = getContinueCopy(summary.nextStep)
  const stats = [
    { label: 'Módulos concluídos', value: summary.modulesCompleted },
    { label: 'Lições concluídas', value: summary.lessonsCompleted },
    { label: 'Quizzes feitos', value: summary.quizzesTaken },
    { label: 'Simulações concluídas', value: summary.simulationsCompleted },
  ]

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-600">Progresso da trilha</p>
            <p className="text-3xl font-bold text-slate-900" data-testid="overall-progress">
              {summary.overallProgress}%
            </p>
          </div>
          <ProgressBar value={summary.overallProgress} label="Progresso geral" />
        </Card>

        <Card className="flex flex-col justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-600">{continueCopy.eyebrow}</p>
            <p className="font-semibold text-slate-900">{continueCopy.title}</p>
          </div>
          <Link to={continueRoute} className={primaryLinkClass}>
            {continueCopy.action}
          </Link>
        </Card>
      </div>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">
          Resumo
        </h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="flex flex-col-reverse gap-1">
              <dt className="text-sm text-slate-600">{stat.label}</dt>
              <dd className="text-2xl font-bold text-slate-900">{stat.value}</dd>
            </Card>
          ))}
        </dl>
      </section>

      <ModuleList modules={summary.modules} />
    </>
  )
}

function getContinueCopy(nextStep: NextStep | null): {
  eyebrow: string
  title: string
  action: string
} {
  if (!nextStep) {
    return { eyebrow: 'Sua trilha', title: 'Veja os módulos disponíveis', action: 'Ver trilha' }
  }

  switch (nextStep.type) {
    case 'trail_completed':
      return { eyebrow: 'Parabéns', title: 'Você concluiu a trilha toda', action: 'Rever trilha' }
    case 'lesson':
      return {
        eyebrow: 'Continue de onde parou',
        title: `Próxima lição de ${nextStep.module.title}`,
        action: 'Continuar lição',
      }
    case 'quiz':
      return {
        eyebrow: 'Continue de onde parou',
        title: `Quiz de ${nextStep.module.title}`,
        action: 'Fazer quiz',
      }
    case 'simulation':
      return {
        eyebrow: 'Continue de onde parou',
        title: `Simulação de ${nextStep.module.title}`,
        action: 'Abrir simulação',
      }
    case 'module':
      return {
        eyebrow: 'Continue de onde parou',
        title: nextStep.module.title,
        action: 'Abrir módulo',
      }
  }
}

function ModuleList({ modules }: { modules: DashboardModule[] }) {
  return (
    <section aria-labelledby="modules-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="modules-title" className="text-lg font-semibold text-slate-900">
          Módulos
        </h2>
        <Link to={ROUTES.TRILHA} className="text-sm font-medium text-primary-700 hover:underline">
          Ver trilha
        </Link>
      </div>
      <ol className="flex flex-col divide-y divide-surface-border rounded-card border border-surface-border bg-surface shadow-card">
        {modules.map(({ module, status }) => {
          const badge = getStatusBadge(status)
          const isLocked = status === 'locked'
          const content = (
            <>
              <span
                className={cn(
                  'flex-1 text-sm font-medium',
                  isLocked ? 'text-slate-500' : 'text-slate-900'
                )}
              >
                {module.order}. {module.title}
              </span>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </>
          )

          return (
            <li key={module.id} data-testid={`dashboard-module-${module.id}`}>
              {isLocked ? (
                <div aria-disabled="true" className="flex items-center gap-3 px-4 py-3">
                  {content}
                </div>
              ) : (
                <Link
                  to={buildModuleRoute(module.id)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted"
                >
                  {content}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando dashboard">
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((item) => (
          <Card key={item} className="flex flex-col gap-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-2 w-full" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Card key={item} className="flex flex-col gap-2">
            <Skeleton className="h-7 w-10" />
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-12 w-full rounded-card" />
        ))}
      </div>
    </div>
  )
}
