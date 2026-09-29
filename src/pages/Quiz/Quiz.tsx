import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button, Card, Skeleton } from '@/components/ui'
import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import { ROUTES, buildModuleRoute } from '@/constants/routes'
import { getQuizForModule } from '@/content/quizzes'
import { useAuth } from '@/hooks/useAuth'
import { ContentUnavailable } from '@/features/modules/components/ContentUnavailable'
import { isModuleComplete } from '@/features/modules/engine/trail'
import { useModuleAccess } from '@/features/modules/hooks/useModuleAccess'
import { QuizEngine } from '@/features/quiz/components/QuizEngine'
import { ResultScreen, type SaveStatus } from '@/features/quiz/components/ResultScreen'
import type { QuizSummary } from '@/features/quiz/engine/scoring'
import { markModuleCompleted, saveQuizAttempt } from '@/services/progress.service'
import { saveQuizResult } from '@/services/quiz.service'
import { mapFirestoreError } from '@/utils/security/errors'
import type { ModuleWithId } from '@/types/module.types'
import type { ProgressDocument } from '@/types/progress.types'
import type { QuizQuestion } from '@/types/quiz.types'

export function Quiz() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const { user } = useAuth()
  const { state } = useModuleAccess(moduleId)

  switch (state.status) {
    case 'loading':
      return <QuizSkeleton />

    case 'error':
      return (
        <ContentUnavailable
          title="Não foi possível carregar o quiz"
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

    case 'ready': {
      const completed = new Set(state.completedLessonIds)
      const allLessonsDone =
        state.lessons.length > 0 && state.lessons.every((lesson) => completed.has(lesson.id))

      // Confiro aqui de novo porque a URL do quiz pode ser digitada sem passar pela página do módulo.
      if (!allLessonsDone) {
        return <Navigate to={buildModuleRoute(state.module.id)} replace />
      }

      const questions = getQuizForModule(state.module.id)
      if (!questions) {
        return (
          <ContentUnavailable
            title="Quiz indisponível"
            description="Este módulo ainda não tem um quiz definido."
            backTo={buildModuleRoute(state.module.id)}
            backLabel="Voltar para o módulo"
          />
        )
      }

      if (!user) return <QuizSkeleton />

      return (
        <QuizSession
          key={state.module.id}
          uid={user.uid}
          module={state.module}
          questions={questions}
          progress={state.progress}
        />
      )
    }
  }
}

interface QuizSessionProps {
  uid: string
  module: ModuleWithId
  questions: QuizQuestion[]
  progress: ProgressDocument | undefined
}

type Phase = 'intro' | 'running' | 'result'

function QuizSession({ uid, module, questions, progress }: QuizSessionProps) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [attempt, setAttempt] = useState(0)
  const [summary, setSummary] = useState<QuizSummary | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saving')
  const [currentProgress, setCurrentProgress] = useState(progress)
  const [isModuleMarked, setIsModuleMarked] = useState((progress?.completedAt ?? null) !== null)

  async function persistResult(result: QuizSummary) {
    setSaveStatus('saving')
    try {
      await saveQuizResult({ userId: uid, moduleId: module.id, ...result })
      await saveQuizAttempt(uid, module.id, result.score)

      if (currentProgress) {
        const previousBest = currentProgress.quizBestScore
        const nextProgress: ProgressDocument = {
          ...currentProgress,
          quizBestScore:
            previousBest === null ? result.score : Math.max(previousBest, result.score),
          quizAttempts: currentProgress.quizAttempts + 1,
        }

        // Só marco uma vez: refazer o quiz depois de concluído não pode sobrescrever o completedAt original.
        if (!isModuleMarked && isModuleComplete(module, nextProgress)) {
          await markModuleCompleted(uid, module.id)
          setIsModuleMarked(true)
        }
        setCurrentProgress(nextProgress)
      }

      setSaveStatus('saved')
    } catch (caughtError) {
      mapFirestoreError(caughtError)
      setSaveStatus('error')
    }
  }

  function handleFinish(result: QuizSummary) {
    setSummary(result)
    setPhase('result')
    void persistResult(result)
  }

  function handleRetry() {
    setSummary(null)
    setAttempt((current) => current + 1)
    setPhase('running')
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        to={buildModuleRoute(module.id)}
        className="text-sm font-medium text-primary-700 hover:underline"
      >
        {module.title}
      </Link>

      {phase === 'intro' && (
        <QuizIntro
          module={module}
          totalQuestions={questions.length}
          progress={currentProgress}
          onStart={() => setPhase('running')}
        />
      )}

      {phase === 'running' && (
        <QuizEngine key={attempt} questions={questions} onFinish={handleFinish} />
      )}

      {phase === 'result' && summary && (
        <ResultScreen
          summary={summary}
          questions={questions}
          saveStatus={saveStatus}
          backTo={buildModuleRoute(module.id)}
          onRetry={handleRetry}
        />
      )}
    </div>
  )
}

interface QuizIntroProps {
  module: ModuleWithId
  totalQuestions: number
  progress: ProgressDocument | undefined
  onStart: () => void
}

function QuizIntro({ module, totalQuestions, progress, onStart }: QuizIntroProps) {
  const bestScore = progress?.quizBestScore ?? null
  const attempts = progress?.quizAttempts ?? 0

  return (
    <Card className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-900">Quiz: {module.title}</h1>
      <ul className="flex flex-col gap-1 text-sm text-slate-700">
        <li>{totalQuestions} questões</li>
        <li>Nota mínima para aprovação: {QUIZ_PASSING_SCORE}</li>
        {bestScore !== null && (
          <li>
            Sua melhor nota até agora: {bestScore} ({attempts}{' '}
            {attempts === 1 ? 'tentativa' : 'tentativas'})
          </li>
        )}
      </ul>
      <p className="rounded-lg bg-warning-50 p-3 text-sm text-slate-800">
        Depois de confirmar uma resposta, não dá para alterá-la. Você pode refazer o quiz quantas
        vezes quiser.
      </p>
      <Button className="self-start" onClick={onStart}>
        Começar quiz
      </Button>
    </Card>
  )
}

function QuizSkeleton() {
  return (
    <div
      className="mx-auto flex max-w-3xl flex-col gap-6"
      aria-busy="true"
      aria-label="Carregando quiz"
    >
      <Card className="flex flex-col gap-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-11 w-36" />
      </Card>
    </div>
  )
}
