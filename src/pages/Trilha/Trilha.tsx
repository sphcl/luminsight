import { Link } from 'react-router-dom'
import { Badge, Card, ProgressBar, Skeleton } from '@/components/ui'
import { ROUTES, buildModuleRoute } from '@/constants/routes'
import { hasPendingText } from '@/content/validate'
import { ContentUnavailable } from '@/features/modules/components/ContentUnavailable'
import { useModules, type ModuleWithStatus } from '@/features/modules/hooks/useModules'
import { formatMinutes, getDifficultyLabel, getStatusBadge } from '@/features/modules/labels'
import { cn } from '@/utils/helpers/classnames'

const SKELETON_CARDS = 5

export function Trilha() {
  const { data, isLoading, error } = useModules()

  if (error) {
    return (
      <ContentUnavailable
        title="Não foi possível carregar a trilha"
        description={error}
        backTo={ROUTES.DASHBOARD}
        backLabel="Voltar para o dashboard"
      />
    )
  }

  const hasPendingContent = data?.some(hasPendingText) ?? false

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Trilha de aprendizado</h1>
        <p className="mt-1 text-slate-600">
          Os módulos liberam em sequência, conforme você conclui o anterior.
        </p>
      </header>

      {hasPendingContent && (
        <div
          role="status"
          className="rounded-card border border-warning-200 bg-warning-50 p-4 text-sm text-slate-800"
        >
          Parte do conteúdo da trilha ainda está em construção. Os textos marcados com [PENDENTE]
          serão substituídos pela versão final.
        </div>
      )}

      {isLoading || !data ? (
        <ol className="flex flex-col gap-4" aria-busy="true" aria-label="Carregando módulos">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <li key={index}>
              <ModuleCardSkeleton />
            </li>
          ))}
        </ol>
      ) : data.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">Nenhum módulo publicado ainda.</p>
        </Card>
      ) : (
        <ol className="flex flex-col gap-4">
          {data.map((module) => (
            <li key={module.id}>
              <ModuleCard module={module} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function ModuleCard({ module }: { module: ModuleWithStatus }) {
  const isLocked = module.status === 'locked'
  const statusBadge = getStatusBadge(module.status)

  const content = (
    <Card
      interactive={!isLocked}
      className={cn('flex flex-col gap-3', isLocked && 'cursor-not-allowed opacity-60')}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        <Badge>{getDifficultyLabel(module.difficulty)}</Badge>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {module.order}. {module.title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{module.description}</p>
      </div>
      <p className="text-sm text-slate-500">
        {formatMinutes(module.estimatedMinutes)} · {module.totalLessons}{' '}
        {module.totalLessons === 1 ? 'lição' : 'lições'}
      </p>
      <ProgressBar value={module.progressPercent} label="Conclusão" showPercentage />
      {isLocked && (
        <p className="text-sm text-slate-500">Conclua o módulo anterior para liberar este.</p>
      )}
    </Card>
  )

  if (isLocked) {
    return (
      <div aria-disabled="true" data-testid={`module-card-${module.id}`}>
        {content}
      </div>
    )
  }

  return (
    <Link
      to={buildModuleRoute(module.id)}
      data-testid={`module-card-${module.id}`}
      className="block rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {content}
    </Link>
  )
}

function ModuleCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-2 w-full" />
    </Card>
  )
}
