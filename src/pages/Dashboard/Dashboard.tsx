import { Link } from 'react-router-dom'
import { Badge, Card, ProgressBar, Skeleton } from '@/components/ui'
import { ROUTES, buildModuleRoute } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { ContentUnavailable } from '@/features/modules/components/ContentUnavailable'
import { getStatusBadge } from '@/features/modules/labels'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { TrailFeedbackCard } from '@/features/research/components/TrailFeedbackCard'
import { isFinalQuiz } from '@/content/quizzes'
import type {
  DashboardModule,
  DashboardSummary,
  NextStep,
} from '@/features/dashboard/engine/dashboard'
import { cn } from '@/utils/helpers/classnames'
import { primaryLinkClass, textLinkClass } from '@/components/ui/linkStyles'

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
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <header>
        <p className="eyebrow">Seu painel</p>
        <h1 className="page-title mt-2">Olá, {displayName}</h1>
        <p className="mt-3 text-ink-soft">Aqui está o resumo do seu aprendizado.</p>
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
          <h2 className="font-serif text-3xl font-normal text-ink">Vamos começar?</h2>
          <p className="mt-2 text-ink-soft">
            {firstModule
              ? `A trilha começa pelo módulo 1, ${firstModule.title}. Cada módulo libera o próximo quando você termina.`
              : 'Nenhum módulo publicado ainda. Volte daqui a pouco.'}
          </p>
        </div>
        {firstModule && (
          <Link
            to={buildModuleRoute(firstModule.id)}
            className={cn(primaryLinkClass, 'self-start')}
          >
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
  const trailCompleted = summary.modules.some(
    ({ module, status }) => isFinalQuiz(module.id) && status === 'completed'
  )
  const stats = [
    { label: 'Módulos concluídos', value: summary.modulesCompleted },
    { label: 'Lições concluídas', value: summary.lessonsCompleted },
    { label: 'Quizzes feitos', value: summary.quizzesTaken },
    { label: 'Simulações concluídas', value: summary.simulationsCompleted },
  ]

  return (
    <>
      <TrailFeedbackCard trailCompleted={trailCompleted} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col justify-between gap-3">
          <div>
            <p className="eyebrow">Progresso da trilha</p>
            <p
              className="mt-2 font-serif text-5xl font-normal tracking-[-0.02em] text-ink tabular-nums"
              data-testid="overall-progress"
            >
              {summary.overallProgress}%
            </p>
          </div>
          <ProgressBar value={summary.overallProgress} label="Progresso geral" />
        </Card>

        <Card className="flex flex-col justify-between gap-3">
          <div>
            <p className="eyebrow">{continueCopy.eyebrow}</p>
            <p className="mt-2 text-lg font-semibold text-ink">{continueCopy.title}</p>
          </div>
          <Link to={continueRoute} className={cn(primaryLinkClass, 'self-start')}>
            {continueCopy.action}
          </Link>
        </Card>
      </div>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">
          Resumo
        </h2>
        <dl className="grid grid-cols-2 border-t border-rule sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse gap-1 border-b border-rule py-4 pr-4 sm:border-b-0"
            >
              <dt className="text-sm text-ink-soft">{stat.label}</dt>
              <dd className="font-serif text-4xl font-normal text-ink tabular-nums">
                {stat.value}
              </dd>
            </div>
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
        <h2 id="modules-title" className="text-lg font-semibold text-ink">
          Módulos
        </h2>
        <Link to={ROUTES.TRILHA} className={textLinkClass}>
          Ver trilha
        </Link>
      </div>
      <ol className="flex flex-col divide-y divide-rule border-y border-rule">
        {modules.map(({ module, status }) => {
          const badge = getStatusBadge(status)
          const isLocked = status === 'locked'
          const content = (
            <>
              <span
                aria-hidden="true"
                className="w-10 shrink-0 font-serif text-2xl leading-none text-ink-muted tabular-nums"
              >
                {String(module.order).padStart(2, '0')}
              </span>
              <span
                className={cn('flex-1 font-serif text-lg', isLocked ? 'text-ink-soft' : 'text-ink')}
              >
                <span className="sr-only">{module.order}.</span> {module.title}
              </span>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </>
          )

          return (
            <li key={module.id} data-testid={`dashboard-module-${module.id}`}>
              {isLocked ? (
                <div aria-disabled="true" className="flex min-h-14 items-center gap-3 py-3">
                  {content}
                </div>
              ) : (
                <Link
                  to={buildModuleRoute(module.id)}
                  className="flex min-h-14 items-center gap-3 py-3 transition-colors hover:bg-surface-muted motion-reduce:transition-none"
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
