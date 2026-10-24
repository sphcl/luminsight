import type { QuizQuestion } from '@/types/quiz.types'

type WithoutAnswer<T> = T extends QuizQuestion
  ? T extends { type: 'multiple_answer' }
    ? Omit<T, 'correctOptionIds' | 'explanation'> & { expectedSelections: number }
    : Omit<T, 'correctOptionId' | 'explanation'>
  : never

export type PublicQuestion = WithoutAnswer<QuizQuestion>

// Monto campo a campo em vez de fazer spread, pro gabarito nem chegar nas props do QuestionCard.
export function toPublicQuestion(question: QuizQuestion): PublicQuestion {
  const base = { id: question.id, prompt: question.prompt, options: question.options }

  switch (question.type) {
    case 'multiple_choice':
    case 'true_false':
      return { ...base, type: question.type }
    case 'scenario':
      return { ...base, type: question.type, scenario: question.scenario }
    case 'visual':
      return {
        ...base,
        type: question.type,
        imageSrc: question.imageSrc,
        imageAlt: question.imageAlt,
      }
    // Só a quantidade de corretas vai pra tela, nunca quais são.
    case 'multiple_answer':
      return {
        ...base,
        type: question.type,
        scenario: question.scenario,
        expectedSelections: question.correctOptionIds.length,
      }
  }
}
