import type { QuizQuestion } from '@/types/quiz.types'

type MultipleChoiceQuestion = Extract<QuizQuestion, { type: 'multiple_choice' }>

export function buildQuestion(overrides: Partial<MultipleChoiceQuestion> = {}): QuizQuestion {
  return {
    id: 'q1',
    type: 'multiple_choice',
    prompt: 'Pergunta',
    options: [
      { id: 'a', text: 'Alternativa A' },
      { id: 'b', text: 'Alternativa B' },
      { id: 'c', text: 'Alternativa C' },
      { id: 'd', text: 'Alternativa D' },
    ],
    correctOptionId: 'a',
    explanation: 'Explicação',
    ...overrides,
  }
}

export function buildQuestions(count: number): QuizQuestion[] {
  return Array.from({ length: count }, (_, index) =>
    buildQuestion({ id: `q${index + 1}`, prompt: `Pergunta ${index + 1}` })
  )
}
