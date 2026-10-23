import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge, Card, ProgressBar, Skeleton } from '@/components/ui'
import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import { ROUTES, buildLessonRoute, buildQuizRoute } from '@/constants/routes'
import { ContentUnavailable } from '@/features/modules/components/ContentUnavailable'
import { ModuleNumber } from '@/features/modules/components/ModuleNumber'
import { useModuleAccess, type ModuleAccessData } from '@/features/modules/hooks/useModuleAccess'
import { formatMinutes, getDifficultyLabel, getStatusBadge } from '@/features/modules/labels'
import { cn } from '@/utils/helpers/classnames'
import { useDocumentTitle } from '@/lib/router/useDocumentTitle'
import { parseRouteId } from '@/utils/security/route-params'
import { primaryLinkClass, textLinkClass } from '@/components/ui/linkStyles'

export function Modulo() {
  const moduleId = parseRouteId(useParams<{ moduleId: string }>().moduleId)
  const { state } = useModuleAccess(moduleId)

  switch (state.status) {
    case 'loading':
      return <ModuleSkeleton />

    case 'error':
      return (
        <ContentUnavailable
          title="Não foi possível carregar o módulo"
          description={state.message}
          backTo={ROUTES.TRILHA}
          backLabel="Voltar para a trilha"
        />
      )

    case 'not_found':
      return (
        <ContentUnavailable
          title="Módulo não encontrado"
          description="Esse módulo não existe ou não está disponível."
          backTo={ROUTES.TRILHA}
          backLabel="Voltar para a trilha"
        />
      )

    case 'locked':
      return <Navigate to={ROUTES.TRILHA} replace />

    case 'ready':
      return <ModuleView {...state} />
  }
}

function ModuleView({
  module,
  lessons,
  moduleStatus,
  progressPercent,
  completedLessonIds,
  progress,
}: ModuleAccessData) {
  useDocumentTitle(module.title)
  const completed = new Set(completedLessonIds)
  const nextLesson = lessons.find((lesson) => !completed.has(lesson.id)) ?? lessons[0]
  const hasStarted = lessons.some((lesson) => completed.has(lesson.id))
  const allLessonsDone = lessons.length > 0 && lessons.every((lesson) => completed.has(lesson.id))
  const statusBadge = getStatusBadge(moduleStatus)
  const quizBestScore = progress?.quizBestScore ?? null

  let primaryLabel = 'Começar módulo'
  if (allLessonsDone) primaryLabel = 'Revisar lições'
  else if (hasStarted) primaryLabel = 'Continuar de onde parei'

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <Link to={ROUTES.TRILHA} className={cn(textLinkClass, 'self-start')}>
        Voltar para a trilha
      </Link>

      <header className="relative flex flex-col gap-5 md:pl-20">
        <ModuleNumber order={module.order} className="md:top-0" />
        <div className="flex flex-wrap gap-2">
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          <Badge>{getDifficultyLabel(module.difficulty)}</Badge>
          <Badge>{formatMinutes(module.estimatedMinutes)}</Badge>
        </div>
        <div>
          <h1 className="page-title">{module.title}</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">{module.description}</p>
        </div>
        <ProgressBar value={progressPercent} label="Progresso do módulo" showPercentage />
        {nextLesson && (
          <Link
            to={buildLessonRoute(module.id, nextLesson.id)}
            className={cn(primaryLinkClass, 'self-start')}
          >
            {primaryLabel}
          </Link>
        )}
      </header>

      <section aria-labelledby="lessons-title" className="flex flex-col gap-3">
        <h2 id="lessons-title" className="text-lg font-semibold text-ink">
          Lições
        </h2>
        {lessons.length === 0 ? (
          <p className="text-sm text-ink-soft">Este módulo ainda não tem lições publicadas.</p>
        ) : (
          <ol className="flex flex-col border-t border-rule">
            {lessons.map((lesson, index) => {
              const isDone = completed.has(lesson.id)
              return (
                <li key={lesson.id} className="border-b border-rule">
                  <Link
                    to={buildLessonRoute(module.id, lesson.id)}
                    className="flex min-h-16 items-center gap-4 py-4 transition-colors hover:bg-surface-muted motion-reduce:transition-none"
                  >
                    <span
                      aria-hidden="true"
                      className="w-8 shrink-0 font-serif text-2xl leading-none text-ink-muted tabular-nums"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">
                      <span className="block font-serif text-xl text-ink">{lesson.title}</span>
                      <span className="block text-sm text-ink-muted">
                        {formatMinutes(lesson.estimatedMinutes)}
                      </span>
                    </span>
                    {isDone && <Badge variant="success">Concluída</Badge>}
                  </Link>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="practice-title" className="flex flex-col gap-3">
        <h2 id="practice-title" className="text-lg font-semibold text-ink">
          Prática
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {allLessonsDone ? (
            <Link
              to={buildQuizRoute(module.id)}
              className="rounded-card border border-rule bg-surface p-4 transition-colors hover:border-strong motion-reduce:transition-none"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <span className="text-lg font-semibold text-ink">Quiz do módulo</span>
                {quizBestScore !== null && (
                  <Badge variant={quizBestScore >= QUIZ_PASSING_SCORE ? 'success' : 'warning'}>
                    Melhor nota: {quizBestScore}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {quizBestScore === null
                  ? 'Perguntas para fixar o que você aprendeu.'
                  : 'Refaça quando quiser para melhorar sua nota.'}
              </p>
            </Link>
          ) : (
            <UnavailableActivity
              title="Quiz do módulo"
              description="Conclua todas as lições para liberar o quiz."
              badge="Bloqueado"
            />
          )}
          {module.hasSimulation && (
            <Link
              to={ROUTES.SIMULACOES}
              className="rounded-card border border-rule bg-surface p-4 transition-colors hover:border-strong motion-reduce:transition-none"
            >
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <span className="text-lg font-semibold text-ink">Simulação</span>
                {progress?.simulationCompleted && <Badge variant="success">Concluída</Badge>}
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Um cenário realista para colocar em prática.
              </p>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

function UnavailableActivity({
  title,
  description,
  badge,
}: {
  title: string
  description: string
  badge: string
}) {
  return (
    <div
      aria-disabled="true"
      className="rounded-card border border-dashed border-rule bg-surface-muted p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <span className="text-lg font-semibold text-ink-soft">{title}</span>
        <Badge>{badge}</Badge>
      </div>
      <p className="mt-1 text-sm text-ink-muted">{description}</p>
    </div>
  )
}

function ModuleSkeleton() {
  return (
    <div
      className="mx-auto flex max-w-3xl flex-col gap-6"
      aria-busy="true"
      aria-label="Carregando módulo"
    >
      <Card className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-2 w-full" />
      </Card>
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-16 w-full rounded-card" />
      ))}
    </div>
  )
}
