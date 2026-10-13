import { describe, it, expect } from 'vitest'
import { summarizeDashboard } from './dashboard'
import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import { buildModule, buildProgress, buildTrail } from '@/test/fixtures/modules'

const completedProgress = buildProgress({
  lessonsCompleted: ['licao-01', 'licao-02'],
  quizBestScore: 90,
  quizAttempts: 2,
  simulationCompleted: true,
})

describe('summarizeDashboard', () => {
  it('marca como não iniciado quando não há progresso', () => {
    const summary = summarizeDashboard(buildTrail(), {})

    expect(summary.hasStarted).toBe(false)
    expect(summary.overallProgress).toBe(0)
  })

  it('não conta documento de progresso vazio como início', () => {
    const summary = summarizeDashboard(buildTrail(), { 'modulo-01': buildProgress() })

    expect(summary.hasStarted).toBe(false)
  })

  it('conta módulos, lições, quizzes e simulações', () => {
    const summary = summarizeDashboard(buildTrail(), {
      'modulo-01': completedProgress,
      'modulo-02': buildProgress({
        lessonsCompleted: ['licao-01'],
        quizAttempts: 1,
        quizBestScore: 40,
      }),
    })

    expect(summary).toMatchObject({
      hasStarted: true,
      modulesCompleted: 1,
      lessonsCompleted: 3,
      quizzesTaken: 2,
      simulationsCompleted: 1,
    })
  })

  it('calcula o progresso geral pelas etapas da trilha', () => {
    // buildTrail tem 5 módulos de 2 lições + quiz + simulação = 20 etapas; módulo 1 completo = 4
    const summary = summarizeDashboard(buildTrail(), { 'modulo-01': completedProgress })

    expect(summary.overallProgress).toBe(20)
  })

  it('ignora progresso de módulo que não está na trilha', () => {
    const summary = summarizeDashboard(buildTrail(), { 'modulo-antigo': completedProgress })

    expect(summary.hasStarted).toBe(false)
    expect(summary.lessonsCompleted).toBe(0)
  })

  it('aponta a próxima lição pendente', () => {
    const summary = summarizeDashboard(buildTrail(), {
      'modulo-01': buildProgress({ lessonsCompleted: ['licao-01'] }),
    })

    expect(summary.nextStep).toMatchObject({
      type: 'lesson',
      module: { id: 'modulo-01' },
      completedLessonIds: ['licao-01'],
    })
  })

  it('aponta o quiz quando as lições acabaram e ainda não passou', () => {
    const summary = summarizeDashboard(buildTrail(), {
      'modulo-01': buildProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        quizBestScore: QUIZ_PASSING_SCORE - 1,
        quizAttempts: 1,
      }),
    })

    expect(summary.nextStep).toMatchObject({ type: 'quiz', module: { id: 'modulo-01' } })
  })

  it('aponta a simulação quando falta só ela', () => {
    const summary = summarizeDashboard(buildTrail(), {
      'modulo-01': buildProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        quizBestScore: 100,
        quizAttempts: 1,
      }),
    })

    expect(summary.nextStep).toMatchObject({ type: 'simulation', module: { id: 'modulo-01' } })
  })

  it('passa pro próximo módulo liberado quando o anterior foi concluído', () => {
    const summary = summarizeDashboard(buildTrail(), { 'modulo-01': completedProgress })

    expect(summary.nextStep).toMatchObject({ type: 'lesson', module: { id: 'modulo-02' } })
  })

  it('avisa quando a trilha toda foi concluída', () => {
    const module = buildModule()
    const summary = summarizeDashboard([module], { [module.id]: completedProgress })

    expect(summary.nextStep).toEqual({ type: 'trail_completed' })
    expect(summary.overallProgress).toBe(100)
  })
})
