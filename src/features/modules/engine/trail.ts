import type { ModuleWithId } from '@/types/module.types'
import type { ModuleStatus, ProgressDocument, ProgressMap } from '@/types/progress.types'

// Nota de pontuação mínima (0-100) para considerar o quiz de um módulo
// aprovado. Vive aqui (não no Firestore, não no ModuleDocument) porque é
// regra de negócio da trilha, não conteúdo (mesmo critério que a tela de
// quiz (Fase 8) usa para preencher QuizResultDocument.passed).
export const QUIZ_PASSING_SCORE = 70

function isModuleComplete(module: ModuleWithId, progress: ProgressDocument): boolean {
  const allLessonsDone = progress.lessonsCompleted.length >= module.totalLessons
  const quizPassed = progress.quizBestScore !== null && progress.quizBestScore >= QUIZ_PASSING_SCORE

  return allLessonsDone && progress.simulationCompleted && quizPassed
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

// Percentual (0-100) considerando lições + quiz aprovado + simulação como
// etapas de peso igual. module.totalLessons existe exatamente para essa
// conta: evita ter que passar a lista inteira de lições só para saber quantas
// faltam.
export function calculateModuleProgress(
  module: ModuleWithId,
  progress: ProgressDocument | undefined
): number {
  if (!progress) return 0

  const totalSteps = module.totalLessons + 2
  if (totalSteps <= 0) return 0

  const completedLessons = Math.min(progress.lessonsCompleted.length, module.totalLessons)
  const quizPassed = progress.quizBestScore !== null && progress.quizBestScore >= QUIZ_PASSING_SCORE
  const completedSteps =
    completedLessons + (quizPassed ? 1 : 0) + (progress.simulationCompleted ? 1 : 0)

  return Math.round((completedSteps / totalSteps) * 100)
}
