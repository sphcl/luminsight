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

function hasAnyProgress(progress: ProgressDocument): boolean {
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

// Percentual (0-100) considerando lições + quiz aprovado + simulação (se houver) como
// etapas de peso igual. module.totalLessons existe exatamente para essa
// conta: evita ter que passar a lista inteira de lições só para saber quantas
// faltam.
export function calculateModuleProgress(
  module: ModuleWithId,
  progress: ProgressDocument | undefined
): number {
  if (!progress) return 0

  const simulationSteps = module.hasSimulation ? 1 : 0
  const totalSteps = module.totalLessons + 1 + simulationSteps
  if (totalSteps <= 0) return 0

  const completedLessons = Math.min(progress.lessonsCompleted.length, module.totalLessons)
  const quizPassed = progress.quizBestScore !== null && progress.quizBestScore >= QUIZ_PASSING_SCORE
  const completedSteps =
    completedLessons +
    (quizPassed ? 1 : 0) +
    (module.hasSimulation && progress.simulationCompleted ? 1 : 0)

  return Math.round((completedSteps / totalSteps) * 100)
}
