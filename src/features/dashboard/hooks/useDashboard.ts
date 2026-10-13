import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  ROUTES,
  buildLessonRoute,
  buildModuleRoute,
  buildQuizRoute,
  buildSimulationRoute,
} from '@/constants/routes'
import { getLessons, getModules } from '@/services/modules.service'
import { getUserProgress } from '@/services/progress.service'
import { getSimulations } from '@/services/simulations.service'
import { summarizeDashboard, type DashboardSummary, type NextStep } from '../engine/dashboard'
import { mapFirestoreError } from '@/utils/security/errors'

interface DashboardData {
  summary: DashboardSummary
  continueRoute: string
}

interface UseDashboardReturn {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
}

// Só busco lições ou simulações do passo que interessa, pra não ler a trilha inteira à toa.
async function resolveContinueRoute(nextStep: NextStep | null): Promise<string> {
  if (!nextStep || nextStep.type === 'trail_completed') return ROUTES.TRILHA

  const { module } = nextStep
  switch (nextStep.type) {
    case 'lesson': {
      const lessons = await getLessons(module.id)
      const completed = new Set(nextStep.completedLessonIds)
      const nextLesson = lessons.find((lesson) => !completed.has(lesson.id))
      return nextLesson ? buildLessonRoute(module.id, nextLesson.id) : buildModuleRoute(module.id)
    }
    case 'quiz':
      return buildQuizRoute(module.id)
    case 'simulation': {
      const simulations = await getSimulations()
      const simulation = simulations.find((candidate) => candidate.moduleId === module.id)
      return simulation ? buildSimulationRoute(simulation.id) : ROUTES.SIMULACOES
    }
    case 'module':
      return buildModuleRoute(module.id)
  }
}

export function useDashboard(): UseDashboardReturn {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    void (async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!user) {
          if (isCurrent) setData(null)
          return
        }

        const [modules, progressMap] = await Promise.all([getModules(), getUserProgress(user.uid)])
        const summary = summarizeDashboard(modules, progressMap)
        const continueRoute = summary.hasStarted
          ? await resolveContinueRoute(summary.nextStep)
          : ROUTES.TRILHA
        if (!isCurrent) return

        setData({ summary, continueRoute })
      } catch (caughtError) {
        if (!isCurrent) return
        setError(mapFirestoreError(caughtError))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    })()

    return () => {
      isCurrent = false
    }
  }, [user])

  return { data, isLoading, error }
}
