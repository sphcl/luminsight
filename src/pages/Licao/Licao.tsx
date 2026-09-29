import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button, Card, Skeleton } from '@/components/ui'
import { ROUTES, buildLessonRoute, buildModuleRoute } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { ContentBlockRenderer } from '@/features/modules/components/ContentBlockRenderer'
import { ContentUnavailable } from '@/features/modules/components/ContentUnavailable'
import { useModuleAccess } from '@/features/modules/hooks/useModuleAccess'
import { formatCountdown, useReadingTimer } from '@/features/modules/hooks/useReadingTimer'
import { formatMinutes } from '@/features/modules/labels'
import { markLessonCompleted } from '@/services/progress.service'
import { mapFirestoreError } from '@/utils/security/errors'
import type { LessonWithId, ModuleWithId } from '@/types/module.types'

const secondaryLinkClass =
  'inline-flex h-11 items-center justify-center rounded-lg border border-surface-border bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-surface-muted'

export function Licao() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>()
  const { user } = useAuth()
  const { state, addCompletedLesson } = useModuleAccess(moduleId)

  switch (state.status) {
    case 'loading':
      return <LessonSkeleton />

    case 'error':
      return (
        <ContentUnavailable
          title="Não foi possível carregar a lição"
          description={state.message}
          backTo={ROUTES.TRILHA}
          backLabel="Voltar para a trilha"
        />
      )

    case 'not_found':
      return (
        <ContentUnavailable
          title="Módulo não encontrado"
          description="O módulo desta lição não existe ou não está disponível."
          backTo={ROUTES.TRILHA}
          backLabel="Voltar para a trilha"
        />
      )

    case 'locked':
      return <Navigate to={ROUTES.TRILHA} replace />

    case 'ready': {
      const lessonIndex = state.lessons.findIndex((lesson) => lesson.id === lessonId)
      // eslint-disable-next-line security/detect-object-injection -- índice vem de findIndex
      const lesson = lessonIndex >= 0 ? state.lessons[lessonIndex] : undefined

      if (!lesson || !user) {
        return (
          <ContentUnavailable
            title="Lição não encontrada"
            description="Essa lição não existe neste módulo."
            backTo={buildModuleRoute(state.module.id)}
            backLabel="Voltar para o módulo"
          />
        )
      }

      return (
        <LessonView
          key={lesson.id}
          uid={user.uid}
          module={state.module}
          lesson={lesson}
          lessons={state.lessons}
          lessonIndex={lessonIndex}
          isCompleted={state.completedLessonIds.includes(lesson.id)}
          onCompleted={addCompletedLesson}
        />
      )
    }
  }
}

interface LessonViewProps {
  uid: string
  module: ModuleWithId
  lesson: LessonWithId
  lessons: LessonWithId[]
  lessonIndex: number
  isCompleted: boolean
  onCompleted: (lessonId: string) => void
}

function LessonView({
  uid,
  module,
  lesson,
  lessons,
  lessonIndex,
  isCompleted,
  onCompleted,
}: LessonViewProps) {
  const navigate = useNavigate()
  const previousLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : undefined
  const nextLesson = lessons[lessonIndex + 1]
  const remainingSeconds = useReadingTimer(lesson.readingTimeSeconds)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const canContinue = isCompleted || remainingSeconds === 0
  const nextRoute = nextLesson
    ? buildLessonRoute(module.id, nextLesson.id)
    : buildModuleRoute(module.id)

  let continueLabel: string
  if (isCompleted) {
    continueLabel = nextLesson ? 'Próxima lição' : 'Voltar ao módulo'
  } else {
    continueLabel = nextLesson ? 'Concluir e ir para a próxima' : 'Concluir e voltar ao módulo'
  }

  async function handleContinue() {
    if (isCompleted) {
      navigate(nextRoute)
      return
    }

    setIsSaving(true)
    setSaveError(null)
    try {
      await markLessonCompleted(uid, module.id, lesson.id)
      onCompleted(lesson.id)
      navigate(nextRoute)
    } catch (caughtError) {
      setSaveError(mapFirestoreError(caughtError))
      setIsSaving(false)
    }
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <Link
          to={buildModuleRoute(module.id)}
          className="text-sm font-medium text-primary-700 hover:underline"
        >
          {module.title}
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          Lição {lessonIndex + 1} de {lessons.length} · {formatMinutes(lesson.estimatedMinutes)}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{lesson.title}</h1>
      </header>

      <Card className="flex flex-col gap-5">
        {lesson.content.map((block, index) => (
          <ContentBlockRenderer key={index} block={block} />
        ))}
      </Card>

      <footer className="flex flex-col gap-3">
        {!canContinue && (
          <p id="reading-timer" className="text-sm text-slate-600">
            Sem pressa: aproveite a leitura. O botão de concluir libera em{' '}
            <span className="font-semibold tabular-nums">{formatCountdown(remainingSeconds)}</span>.
          </p>
        )}

        {saveError && (
          <p role="alert" className="text-sm text-danger-700">
            {saveError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {previousLesson ? (
            <Link
              to={buildLessonRoute(module.id, previousLesson.id)}
              className={secondaryLinkClass}
            >
              Lição anterior
            </Link>
          ) : (
            <Link to={buildModuleRoute(module.id)} className={secondaryLinkClass}>
              Voltar ao módulo
            </Link>
          )}

          <Button
            onClick={() => void handleContinue()}
            disabled={!canContinue}
            isLoading={isSaving}
            aria-describedby={canContinue ? undefined : 'reading-timer'}
          >
            {continueLabel}
          </Button>
        </div>
      </footer>
    </article>
  )
}

function LessonSkeleton() {
  return (
    <div
      className="mx-auto flex max-w-3xl flex-col gap-6"
      aria-busy="true"
      aria-label="Carregando lição"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-3/4" />
      </div>
      <Card className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-20 w-full" />
      </Card>
    </div>
  )
}
