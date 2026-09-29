import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import type { QuizAnswer, QuizQuestion, QuizResultDocument } from '@/types/quiz.types'

// Resultado sem userId, moduleId e completedAt: esses três dependem de sessão e do servidor, não da correção.
export type QuizSummary = Omit<QuizResultDocument, 'userId' | 'moduleId' | 'completedAt'>

export function gradeAnswer(question: QuizQuestion, selectedOptionId: string): boolean {
  return selectedOptionId === question.correctOptionId
}

export function calculateScore(answers: QuizAnswer[], totalQuestions: number): number {
  if (totalQuestions <= 0) return 0

  const correctAnswers = answers.filter((answer) => answer.correct).length
  // Arredondo pra baixo pra 69,5 nunca virar 70 e aprovar quem ficou abaixo do mínimo.
  return Math.min(100, Math.floor((correctAnswers / totalQuestions) * 100))
}

export function isPassing(score: number): boolean {
  return score >= QUIZ_PASSING_SCORE
}

export function summarizeResult(
  answers: QuizAnswer[],
  questions: QuizQuestion[],
  timeSpentSeconds: number
): QuizSummary {
  const questionsById = new Map(questions.map((question) => [question.id, question]))

  // Recorrijo pelo gabarito em vez de confiar no campo correct que veio junto da resposta.
  const gradedAnswers = answers.flatMap((answer) => {
    const question = questionsById.get(answer.questionId)
    if (!question) return []
    return [{ ...answer, correct: gradeAnswer(question, answer.selectedOptionId) }]
  })

  const score = calculateScore(gradedAnswers, questions.length)

  return {
    score,
    totalQuestions: questions.length,
    correctAnswers: gradedAnswers.filter((answer) => answer.correct).length,
    timeSpentSeconds: Math.max(0, Math.round(timeSpentSeconds)),
    passed: isPassing(score),
    answers: gradedAnswers,
  }
}
