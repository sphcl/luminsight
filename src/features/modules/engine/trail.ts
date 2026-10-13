import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import type { ModuleWithId } from '@/types/module.types'
import type { ModuleStatus, ProgressDocument, ProgressMap } from '@/types/progress.types'

// Simulação só conta pra módulo que tem uma; o módulo 1 não tem.
export function isModuleComplete(module: ModuleWithId, progress: ProgressDocument): boolean {
  const allLessonsDone = progress.lessonsCompleted.length >= module.totalLessons
  const quizPassed = progress.quizBestScore !== null && progress.quizBestScore >= QUIZ_PASSING_SCORE
  const simulationDone = !module.hasSimulation || progress.simulationCompleted

  return allLessonsDone && quizPassed && simulationDone
}

export function hasAnyProgress(progress: ProgressDocument): boolean {
  return (
    progress.lessonsCompleted.length > 0 || progress.simulationCompleted || progress.quizAttempts > 0
  )
}

// Função pura e sem dependência de Firebase: recebe o módulo alvo, o mapa de
// progresso do usuário (moduleId -> ProgressDocument) e a lista completa de
// módulos (para resolver requiredModuleId), e devolve o status calculado.
// Nada disso é lido nem gravado, então é totalmente testável sem mocks.
export function getModuleStatus(
  targetModule: ModuleWithId,
  progressMap: ProgressMap,
  allModules: ModuleWithId[]
): ModuleStatus {
  if (targetModule.requiredModuleId) {
    const requiredModule = allModules.find((module) => module.id === targetModule.requiredModuleId)

    // Referência quebrada (o módulo exigido não existe mais na lista) trava
    // por segurança em vez de liberar a trilha por omissão.
    const requiredStatus = requiredModule
      ? getModuleStatus(requiredModule, progressMap, allModules)
      : 'locked'

    if (requiredStatus !== 'completed') {
      return 'locked'
    }
  }

  const progress = progressMap[targetModule.id]
  if (!progress) return 'available'

  if (isModuleComplete(targetModule, progress)) return 'completed'

  return hasAnyProgress(progress) ? 'in_progress' : 'available'
}

interface ModuleSteps {
  completed: number
  total: number
}

// Lições + quiz aprovado + simulação (se houver), todas com o mesmo peso.
function countModuleSteps(
  module: ModuleWithId,
  progress: ProgressDocument | undefined
): ModuleSteps {
  const simulationSteps = module.hasSimulation ? 1 : 0
  const total = Math.max(module.totalLessons, 0) + 1 + simulationSteps
  if (!progress) return { completed: 0, total }

  const completedLessons = Math.min(progress.lessonsCompleted.length, module.totalLessons)
  const quizPassed = progress.quizBestScore !== null && progress.quizBestScore >= QUIZ_PASSING_SCORE
  const completed =
    completedLessons +
    (quizPassed ? 1 : 0) +
    (module.hasSimulation && progress.simulationCompleted ? 1 : 0)

  return { completed, total }
}

// Percentual (0-100) do módulo. module.totalLessons existe exatamente para essa
// conta: evita ter que passar a lista inteira de lições só para saber quantas
// faltam.
export function calculateModuleProgress(
  module: ModuleWithId,
  progress: ProgressDocument | undefined
): number {
  const { completed, total } = countModuleSteps(module, progress)
  return Math.round((completed / total) * 100)
}

// Somo as etapas da trilha toda em vez de tirar média dos módulos, assim módulo com mais lição pesa mais.
export function calculateTrailProgress(modules: ModuleWithId[], progressMap: ProgressMap): number {
  const totals = modules.reduce(
    (sum, module) => {
      const steps = countModuleSteps(module, progressMap[module.id])
      return { completed: sum.completed + steps.completed, total: sum.total + steps.total }
    },
    { completed: 0, total: 0 }
  )

  return totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100)
}
