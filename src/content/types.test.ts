import { describe, it, expect } from 'vitest'
import { buildLessonData, countWords, estimateModuleMinutes, type LessonEntry } from './types'
import { buildBranchingSimulation, buildSimulation } from '@/test/fixtures/simulation'
import { buildQuestions } from '@/test/fixtures/quiz'

function lessonWithWords(count: number): LessonEntry {
  const content = Array.from({ length: count }, () => 'palavra').join(' ')
  return { id: 'licao-01', data: buildLessonData('Lição', 1, [{ type: 'text', content }]) }
}

describe('buildLessonData', () => {
  it.each([
    [60, 20],
    [400, 60],
    [2000, 120],
  ])('lição de %i palavras trava o botão por %i s', (words, seconds) => {
    expect(lessonWithWords(words).data.readingTimeSeconds).toBe(seconds)
  })
})

describe('countWords', () => {
  it('não conta os asteriscos do negrito como palavra', () => {
    expect(countWords([{ type: 'text', content: 'um **dois** três' }])).toBe(3)
    expect(countWords([{ type: 'text', content: 'um ** dois' }])).toBe(2)
  })

  it('conta título e descrição do link', () => {
    expect(
      countWords([
        {
          type: 'link',
          url: 'https://x.example',
          title: 'dois termos',
          description: 'mais três aqui',
        },
      ])
    ).toBe(5)
  })
})

describe('estimateModuleMinutes', () => {
  it('soma leitura a 200 wpm, 30 s por questão e 1 min por decisão', () => {
    // 400 palavras = 2 min, 10 questões = 5 min, 2 decisões = 2 min
    const minutes = estimateModuleMinutes(
      [lessonWithWords(400)],
      buildQuestions(10),
      buildSimulation()
    )
    expect(minutes).toBe(9)
  })

  it('sem simulação conta só leitura e quiz', () => {
    expect(estimateModuleMinutes([lessonWithWords(400)], buildQuestions(10), undefined)).toBe(7)
  })

  it('simulação ramificada conta pelo caminho mais longo', () => {
    // a fixture ramificada vai de 1 a 2 decisões
    expect(
      estimateModuleMinutes([lessonWithWords(400)], buildQuestions(10), buildBranchingSimulation())
    ).toBe(9)
  })

  it('arredonda pro minuto mais próximo e nunca dá zero', () => {
    expect(estimateModuleMinutes([lessonWithWords(30)], [], undefined)).toBe(1)
    // 500 palavras = 2,5 min, mais 1 questão = 3 min
    expect(estimateModuleMinutes([lessonWithWords(500)], buildQuestions(1), undefined)).toBe(3)
  })
})
