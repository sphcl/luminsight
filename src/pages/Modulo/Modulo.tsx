import { Link, Navigate, useParams } from 'react-router-dom'
import { Badge, Card, ProgressBar, Skeleton } from '@/components/ui'
import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import { ROUTES, buildLessonRoute, buildQuizRoute } from '@/constants/routes'
import { ContentUnavailable } from '@/features/modules/components/ContentUnavailable'
import { useModuleAccess, type ModuleAccessData } from '@/features/modules/hooks/useModuleAccess'
import { formatMinutes, getDifficultyLabel, getStatusBadge } from '@/features/modules/labels'
import { cn } from '@/utils/helpers/classnames'

export function Modulo() {
  const { moduleId } = useParams<{ moduleId: string }>()
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link to={ROUTES.TRILHA} className="text-sm font-medium text-primary-700 hover:underline">
        Voltar para a trilha
      </Link>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          <Badge>{getDifficultyLabel(module.difficulty)}</Badge>
          <Badge>{formatMinutes(module.estimatedMinutes)}</Badge>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{module.title}</h1>
          <p className="mt-2 text-slate-600">{module.description}</p>
        </div>
        <ProgressBar value={progressPercent} label="Progresso do módulo" showPercentage />
        {nextLesson && (
          <Link
            to={buildLessonRoute(module.id, nextLesson.id)}
            className="inline-flex h-11 items-center justify-center self-start rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            {primaryLabel}
          </Link>
        )}
      </Card>

      <section aria-labelledby="lessons-title" className="flex flex-col gap-3">
        <h2 id="lessons-title" className="text-lg font-semibold text-slate-900">
          Lições
        </h2>
        {lessons.length === 0 ? (
          <p className="text-sm text-slate-600">Este módulo ainda não tem lições publicadas.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {lessons.map((lesson, index) => {
              const isDone = completed.has(lesson.id)
              return (
                <li key={lesson.id}>
                  <Link
                    to={buildLessonRoute(module.id, lesson.id)}
                    className="flex items-center gap-4 rounded-card border border-surface-border bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                        isDone ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {isDone ? '✓' : index + 1}
                    </span>
                    <span className="flex-1">
                      <span className="block font-medium text-slate-900">{lesson.title}</span>
                      <span className="block text-sm text-slate-500">
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
        <h2 id="practice-title" className="text-lg font-semibold text-slate-900">
          Prática
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {allLessonsDone ? (
            <Link
              to={buildQuizRoute(module.id)}
              className="rounded-card border border-surface-border bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900">Quiz do módulo</span>
                {quizBestScore !== null && (
                  <Badge variant={quizBestScore >= QUIZ_PASSING_SCORE ? 'success' : 'warning'}>
                    Melhor nota: {quizBestScore}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">
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
              className="rounded-card border border-surface-border bg-surface p-4 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900">Simulação</span>
                {progress?.simulationCompleted && <Badge variant="success">Concluída</Badge>}
              </div>
              <p className="mt-1 text-sm text-slate-500">
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
      className="rounded-card border border-dashed border-surface-border bg-surface-muted p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-slate-700">{title}</span>
        <Badge>{badge}</Badge>
      </div>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
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
