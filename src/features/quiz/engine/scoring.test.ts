import { describe, it, expect } from 'vitest'
import { calculateScore, gradeAnswer, isPassing, summarizeResult } from './scoring'
import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import { buildQuestion, buildQuestions } from '@/test/fixtures/quiz'
import type { QuizAnswer } from '@/types/quiz.types'

function buildAnswers(total: number, correctCount: number): QuizAnswer[] {
  return Array.from({ length: total }, (_, index) => ({
    questionId: `q${index + 1}`,
    selectedOptionId: index < correctCount ? 'a' : 'b',
    correct: index < correctCount,
  }))
}

describe('gradeAnswer', () => {
  it('acerta quando a opção é a do gabarito', () => {
    expect(gradeAnswer(buildQuestion({ correctOptionId: 'c' }), 'c')).toBe(true)
  })

  it('erra quando a opção é outra', () => {
    expect(gradeAnswer(buildQuestion({ correctOptionId: 'c' }), 'a')).toBe(false)
  })
})

describe('calculateScore', () => {
  it('dá 100 com todas corretas', () => {
    expect(calculateScore(buildAnswers(10, 10), 10)).toBe(100)
  })

  it('dá 0 com todas erradas', () => {
    expect(calculateScore(buildAnswers(10, 0), 10)).toBe(0)
  })

  it('dá exatamente o limite com 7 de 10', () => {
    expect(calculateScore(buildAnswers(10, 7), 10)).toBe(QUIZ_PASSING_SCORE)
  })

  it('não arredonda pra cima quando fica logo abaixo do limite', () => {
    expect(calculateScore(buildAnswers(200, 139), 200)).toBe(69)
  })

  it('dá 0 com array vazio', () => {
    expect(calculateScore([], 10)).toBe(0)
  })

  it('dá 0 quando não há questões', () => {
    expect(calculateScore([], 0)).toBe(0)
  })
})

describe('isPassing', () => {
  it('aprova exatamente no limite', () => {
    expect(isPassing(QUIZ_PASSING_SCORE)).toBe(true)
  })

  it('reprova logo abaixo do limite', () => {
    expect(isPassing(QUIZ_PASSING_SCORE - 1)).toBe(false)
  })
})

describe('summarizeResult', () => {
  const questions = buildQuestions(10)

  it('monta o resumo com todas corretas', () => {
    const summary = summarizeResult(buildAnswers(10, 10), questions, 95.4)

    expect(summary).toMatchObject({
      score: 100,
      totalQuestions: 10,
      correctAnswers: 10,
      timeSpentSeconds: 95,
      passed: true,
    })
  })

  it('monta o resumo com todas erradas', () => {
    expect(summarizeResult(buildAnswers(10, 0), questions, 60)).toMatchObject({
      score: 0,
      correctAnswers: 0,
      passed: false,
    })
  })

  it('aprova exatamente no limite', () => {
    expect(summarizeResult(buildAnswers(10, 7), questions, 60)).toMatchObject({
      score: 70,
      passed: true,
    })
  })

  it('reprova logo abaixo do limite', () => {
    expect(summarizeResult(buildAnswers(10, 6), questions, 60)).toMatchObject({
      score: 60,
      passed: false,
    })
  })

  it('lida com array vazio de respostas', () => {
    expect(summarizeResult([], questions, 0)).toMatchObject({
      score: 0,
      correctAnswers: 0,
      totalQuestions: 10,
      passed: false,
      answers: [],
    })
  })

  it('recorrige pelo gabarito ignorando o correct informado', () => {
    const forged: QuizAnswer[] = [{ questionId: 'q1', selectedOptionId: 'b', correct: true }]

    expect(summarizeResult(forged, questions, 10).answers[0]?.correct).toBe(false)
  })

  it('ignora resposta de questão que não existe', () => {
    const answers: QuizAnswer[] = [{ questionId: 'q99', selectedOptionId: 'a', correct: true }]

    expect(summarizeResult(answers, questions, 10)).toMatchObject({
      correctAnswers: 0,
      answers: [],
    })
  })
})
