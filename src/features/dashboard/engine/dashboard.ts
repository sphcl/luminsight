import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import {
  calculateTrailProgress,
  getModuleStatus,
  hasAnyProgress,
} from '@/features/modules/engine/trail'
import type { ModuleWithId } from '@/types/module.types'
import type { ModuleStatus, ProgressMap } from '@/types/progress.types'

export interface DashboardModule {
  module: ModuleWithId
  status: ModuleStatus
}

export type NextStep =
  | { type: 'lesson'; module: ModuleWithId; completedLessonIds: string[] }
  | { type: 'quiz'; module: ModuleWithId }
  | { type: 'simulation'; module: ModuleWithId }
  | { type: 'module'; module: ModuleWithId }
  | { type: 'trail_completed' }

export interface DashboardSummary {
  hasStarted: boolean
  overallProgress: number
  modulesCompleted: number
  lessonsCompleted: number
  quizzesTaken: number
  simulationsCompleted: number
  modules: DashboardModule[]
  nextStep: NextStep | null
}

// Mesma ordem que o Modulo libera as coisas: lições, depois quiz, depois simulação.
function findNextStep(modules: DashboardModule[], progressMap: ProgressMap): NextStep | null {
  if (modules.length > 0 && modules.every(({ status }) => status === 'completed')) {
    return { type: 'trail_completed' }
  }

  const current = modules.find(({ status }) => status === 'in_progress' || status === 'available')
  if (!current) return null

  const { module } = current
  const progress = progressMap[module.id]
  const completedLessonIds = progress?.lessonsCompleted ?? []

  if (completedLessonIds.length < module.totalLessons) {
    return { type: 'lesson', module, completedLessonIds }
  }

  const bestScore = progress?.quizBestScore ?? null
  const quizPassed = bestScore !== null && bestScore >= QUIZ_PASSING_SCORE
  if (!quizPassed) return { type: 'quiz', module }

  if (module.hasSimulation && !progress?.simulationCompleted) {
    return { type: 'simulation', module }
  }

  return { type: 'module', module }
}

// Só conto módulo que veio em getModules: progresso de módulo que saiu da trilha não entra no resumo.
export function summarizeDashboard(
  modules: ModuleWithId[],
  progressMap: ProgressMap
): DashboardSummary {
  const dashboardModules = modules.map((module) => ({
    module,
    status: getModuleStatus(module, progressMap, modules),
  }))

  const totals = modules.reduce(
    (sum, module) => {
      const progress = progressMap[module.id]
      if (!progress) return sum

      return {
        lessons: sum.lessons + Math.min(progress.lessonsCompleted.length, module.totalLessons),
        quizzes: sum.quizzes + (progress.quizAttempts > 0 ? 1 : 0),
        simulations:
          sum.simulations + (module.hasSimulation && progress.simulationCompleted ? 1 : 0),
        started: sum.started || hasAnyProgress(progress),
      }
    },
    { lessons: 0, quizzes: 0, simulations: 0, started: false }
  )

  return {
    hasStarted: totals.started,
    overallProgress: calculateTrailProgress(modules, progressMap),
    modulesCompleted: dashboardModules.filter(({ status }) => status === 'completed').length,
    lessonsCompleted: totals.lessons,
    quizzesTaken: totals.quizzes,
    simulationsCompleted: totals.simulations,
    modules: dashboardModules,
    nextStep: findNextStep(dashboardModules, progressMap),
  }
}
