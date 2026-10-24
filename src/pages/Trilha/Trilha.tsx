import { Link } from 'react-router-dom'
import { Badge, Card, ProgressBar, Skeleton } from '@/components/ui'
import { ROUTES, buildModuleRoute } from '@/constants/routes'
import { hasPendingText } from '@/content/validate'
import { ContentUnavailable } from '@/features/modules/components/ContentUnavailable'
import { ModuleNumber } from '@/features/modules/components/ModuleNumber'
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
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <p className="eyebrow">Cinco módulos</p>
        <h1 className="page-title mt-2">Trilha de aprendizado</h1>
        <p className="mt-3 text-ink-soft">
          Os módulos liberam em sequência, conforme você conclui o anterior.
        </p>
      </header>

      {hasPendingContent && (
        <div role="status" className="rounded-card bg-warning-soft p-4 text-sm text-ink">
          Parte do conteúdo da trilha ainda está em construção. Os textos marcados com [PENDENTE]
          serão substituídos pela versão final.
        </div>
      )}

      {isLoading || !data ? (
        <ol className="flex flex-col gap-6" aria-busy="true" aria-label="Carregando módulos">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <li key={index}>
              <ModuleCardSkeleton />
            </li>
          ))}
        </ol>
      ) : data.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-soft">Nenhum módulo publicado ainda.</p>
        </Card>
      ) : (
        <ol className="flex flex-col border-t border-rule">
          {data.map((module, index) => (
            <li
              key={module.id}
              className="border-b border-rule motion-safe:animate-enter"
              // Entrada escalonada: o delay vai por CSSOM, que a CSP sem unsafe-inline permite.
              style={{ animationDelay: `${index * 60}ms` }}
            >
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
    <div className="relative flex flex-col gap-3 py-6 md:pl-20">
      <ModuleNumber order={module.order} className="md:top-6" />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        <Badge>{getDifficultyLabel(module.difficulty)}</Badge>
      </div>
      <div>
        <h2
          className={cn(
            'font-serif text-2xl font-normal tracking-[-0.015em]',
            isLocked ? 'text-ink-soft' : 'text-ink'
          )}
        >
          <span className="sr-only">{module.order}.</span> {module.title}
        </h2>
        <p className="mt-2 text-ink-soft">{module.description}</p>
      </div>
      <p className="text-sm text-ink-muted">
        {formatMinutes(module.estimatedMinutes)} · {module.totalLessons}{' '}
        {module.totalLessons === 1 ? 'lição' : 'lições'}
      </p>
      <ProgressBar value={module.progressPercent} label="Conclusão" showPercentage />
      {isLocked && (
        <p className="text-sm text-ink-muted">Conclua o módulo anterior para liberar este.</p>
      )}
    </div>
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
      className="group block transition-colors hover:bg-surface-muted motion-reduce:transition-none"
    >
      {content}
    </Link>
  )
}

function ModuleCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-sm" />
        <Skeleton className="h-5 w-24 rounded-sm" />
      </div>
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-2 w-full" />
    </Card>
  )
}
