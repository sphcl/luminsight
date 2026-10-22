import { describe, it, expect } from 'vitest'
import { toPublicQuestion } from './public-question'
import type { QuizQuestion } from '@/types/quiz.types'

const common = {
  id: 'q1',
  prompt: 'Pergunta',
  options: [
    { id: 'a', text: 'A' },
    { id: 'b', text: 'B' },
  ],
  explanation: 'Porque B',
}

const base = { ...common, correctOptionId: 'b' }

const questions: QuizQuestion[] = [
  { ...base, type: 'multiple_choice' },
  { ...base, type: 'true_false' },
  { ...base, type: 'scenario', scenario: 'Cenário' },
  { ...base, type: 'visual', imageSrc: '/img.png', imageAlt: 'Print do email' },
]

describe('toPublicQuestion', () => {
  it.each(questions.map((question) => [question.type, question] as const))(
    'tira gabarito e explicação de %s',
    (_, question) => {
      const visible = toPublicQuestion(question)

      expect(visible).not.toHaveProperty('correctOptionId')
      expect(visible).not.toHaveProperty('explanation')
      expect(JSON.stringify(visible)).not.toContain('Porque B')
    }
  )

  it('mantém o que a tela precisa para cada tipo', () => {
    expect(toPublicQuestion(questions[2]!)).toMatchObject({ scenario: 'Cenário' })
    expect(toPublicQuestion(questions[3]!)).toMatchObject({
      imageSrc: '/img.png',
      imageAlt: 'Print do email',
    })
  })

  it('não repassa campo extra que alguém pendure na questão', () => {
    const tampered = { ...questions[0]!, answerKey: 'b' } as unknown as QuizQuestion
    expect(toPublicQuestion(tampered)).not.toHaveProperty('answerKey')
  })

  it('multiple_answer leva só a quantidade de corretas, nunca quais são', () => {
    const visible = toPublicQuestion({
      ...common,
      type: 'multiple_answer',
      correctOptionIds: ['a', 'b'],
      scenario: 'Cenário',
    })

    expect(visible).toMatchObject({ expectedSelections: 2, scenario: 'Cenário' })
    expect(visible).not.toHaveProperty('correctOptionIds')
    expect(visible).not.toHaveProperty('explanation')
  })
})
