import { CONTENT_SIMULATIONS } from '../../src/content'
import { getQuizForModule } from '../../src/content/quizzes'
import { getCorrectOptionIds } from '../../src/features/quiz/engine/scoring'
import type { ExportDecision, ExportQuizAnswer } from './types'

// null quando a questão ou a cena não existe mais no conteúdo: aí não dá pra recalcular, e eu conto à parte.
export function regradeQuizAnswer(moduleId: string, answer: ExportQuizAnswer): boolean | null {
  const question = getQuizForModule(moduleId)?.find(
    (candidate) => candidate.id === answer.questionId
  )
  if (!question) return null
  const expected = new Set(getCorrectOptionIds(question))
  const chosen = new Set(answer.selectedOptionIds)
  return expected.size === chosen.size && [...expected].every((id) => chosen.has(id))
}

export function regradeDecision(simulationId: string, decision: ExportDecision): boolean | null {
  const scene = CONTENT_SIMULATIONS.find(
    (simulation) => simulation.id === simulationId
  )?.scenes.find((candidate) => candidate.id === decision.sceneId)
  const option = scene?.decision.options.find(
    (candidate) => candidate.id === decision.selectedOptionId
  )
  return option ? option.isCorrect : null
}

// Mesmo arredondamento das rules e do app: nota inteira, sempre pra baixo.
export function scoreOf(correct: number, total: number): number {
  return total === 0 ? 0 : Math.floor((correct * 100) / total)
}
