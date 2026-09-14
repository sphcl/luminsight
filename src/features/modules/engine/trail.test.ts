import { describe, it, expect } from 'vitest'
import { Timestamp } from 'firebase/firestore'
import { calculateModuleProgress, getModuleStatus, QUIZ_PASSING_SCORE } from './trail'
import type { ModuleWithId } from '@/types/module.types'
import type { ProgressDocument, ProgressMap } from '@/types/progress.types'

function buildModule(overrides: Partial<ModuleWithId> = {}): ModuleWithId {
  return {
    id: 'modulo-01',
    title: 'Módulo',
    description: 'Descrição',
    order: 1,
    icon: 'shield',
    color: '#000000',
    difficulty: 'iniciante',
    estimatedMinutes: 30,
    totalLessons: 3,
    isActive: true,
    requiredModuleId: null,
    ...overrides,
  }
}

function buildProgress(overrides: Partial<ProgressDocument> = {}): ProgressDocument {
  return {
    startedAt: Timestamp.now(),
    completedAt: null,
    lessonsCompleted: [],
    quizBestScore: null,
    quizAttempts: 0,
    simulationCompleted: false,
    lastUpdatedAt: Timestamp.now(),
    ...overrides,
  }
}

describe('getModuleStatus', () => {
  it('primeiro módulo (sem requiredModuleId) sempre disponível quando não há progresso', () => {
    const module = buildModule({ requiredModuleId: null })
    expect(getModuleStatus(module, {}, [module])).toBe('available')
  })

  it('bloqueia o módulo quando o pré-requisito ainda não foi concluído', () => {
    const prerequisite = buildModule({ id: 'modulo-01', requiredModuleId: null })
    const target = buildModule({ id: 'modulo-02', requiredModuleId: 'modulo-01' })
    const progressMap: ProgressMap = {}

    expect(getModuleStatus(target, progressMap, [prerequisite, target])).toBe('locked')
  })

  it('libera o módulo quando o pré-requisito foi concluído', () => {
    const prerequisite = buildModule({ id: 'modulo-01', requiredModuleId: null, totalLessons: 2 })
    const target = buildModule({ id: 'modulo-02', requiredModuleId: 'modulo-01' })
    const progressMap: ProgressMap = {
      'modulo-01': buildProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        simulationCompleted: true,
        quizBestScore: QUIZ_PASSING_SCORE,
      }),
    }

    expect(getModuleStatus(target, progressMap, [prerequisite, target])).toBe('available')
  })

  it('trava o módulo se a referência de requiredModuleId não existe em allModules', () => {
    const target = buildModule({ id: 'modulo-02', requiredModuleId: 'modulo-fantasma' })
    expect(getModuleStatus(target, {}, [target])).toBe('locked')
  })

  it('marca como in_progress quando há progresso mas ainda não está completo', () => {
    const module = buildModule({ totalLessons: 3 })
    const progressMap: ProgressMap = {
      'modulo-01': buildProgress({ lessonsCompleted: ['licao-01'] }),
    }

    expect(getModuleStatus(module, progressMap, [module])).toBe('in_progress')
  })

  it('marca como in_progress quando só o quiz foi tentado (sem lições concluídas)', () => {
    const module = buildModule({ totalLessons: 3 })
    const progressMap: ProgressMap = {
      'modulo-01': buildProgress({ quizAttempts: 1, quizBestScore: 40 }),
    }

    expect(getModuleStatus(module, progressMap, [module])).toBe('in_progress')
  })

  it('marca como completed quando lições, simulação e quiz aprovado estão feitos', () => {
    const module = buildModule({ totalLessons: 2 })
    const progressMap: ProgressMap = {
      'modulo-01': buildProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        simulationCompleted: true,
        quizBestScore: QUIZ_PASSING_SCORE,
      }),
    }

    expect(getModuleStatus(module, progressMap, [module])).toBe('completed')
  })

  it('não marca como completed se o quiz não atingiu a nota mínima', () => {
    const module = buildModule({ totalLessons: 2 })
    const progressMap: ProgressMap = {
      'modulo-01': buildProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        simulationCompleted: true,
        quizBestScore: QUIZ_PASSING_SCORE - 1,
      }),
    }

    expect(getModuleStatus(module, progressMap, [module])).toBe('in_progress')
  })

  it('resolve uma cadeia de dependências de vários níveis', () => {
    const moduleA = buildModule({ id: 'modulo-A', requiredModuleId: null, totalLessons: 1 })
    const moduleB = buildModule({ id: 'modulo-B', requiredModuleId: 'modulo-A', totalLessons: 1 })
    const moduleC = buildModule({ id: 'modulo-C', requiredModuleId: 'modulo-B', totalLessons: 1 })
    const allModules = [moduleA, moduleB, moduleC]

    // A concluído, B concluído, C ainda sem progresso -> C deve estar 'available'
    const progressMap: ProgressMap = {
      'modulo-A': buildProgress({
        lessonsCompleted: ['licao-01'],
        simulationCompleted: true,
        quizBestScore: QUIZ_PASSING_SCORE,
      }),
      'modulo-B': buildProgress({
        lessonsCompleted: ['licao-01'],
        simulationCompleted: true,
        quizBestScore: QUIZ_PASSING_SCORE,
      }),
    }

    expect(getModuleStatus(moduleA, progressMap, allModules)).toBe('completed')
    expect(getModuleStatus(moduleB, progressMap, allModules)).toBe('completed')
    expect(getModuleStatus(moduleC, progressMap, allModules)).toBe('available')
  })

  it('bloqueia o fim da cadeia se um módulo intermediário não foi concluído', () => {
    const moduleA = buildModule({ id: 'modulo-A', requiredModuleId: null, totalLessons: 1 })
    const moduleB = buildModule({ id: 'modulo-B', requiredModuleId: 'modulo-A', totalLessons: 1 })
    const moduleC = buildModule({ id: 'modulo-C', requiredModuleId: 'modulo-B', totalLessons: 1 })
    const allModules = [moduleA, moduleB, moduleC]

    const progressMap: ProgressMap = {
      'modulo-A': buildProgress({
        lessonsCompleted: ['licao-01'],
        simulationCompleted: true,
        quizBestScore: QUIZ_PASSING_SCORE,
      }),
      // B começou mas não terminou
      'modulo-B': buildProgress({ lessonsCompleted: ['licao-01'] }),
    }

    expect(getModuleStatus(moduleB, progressMap, allModules)).toBe('in_progress')
    expect(getModuleStatus(moduleC, progressMap, allModules)).toBe('locked')
  })
})

describe('calculateModuleProgress', () => {
  it('retorna 0 quando não há progresso registrado', () => {
    const module = buildModule({ totalLessons: 3 })
    expect(calculateModuleProgress(module, undefined)).toBe(0)
  })

  it('calcula percentual parcial considerando lições, quiz e simulação como etapas', () => {
    // 3 lições + quiz + simulação = 5 etapas; 1 lição concluída = 1/5 = 20%
    const module = buildModule({ totalLessons: 3 })
    const progress = buildProgress({ lessonsCompleted: ['licao-01'] })

    expect(calculateModuleProgress(module, progress)).toBe(20)
  })

  it('retorna 100 quando lições, quiz aprovado e simulação estão completos', () => {
    const module = buildModule({ totalLessons: 2 })
    const progress = buildProgress({
      lessonsCompleted: ['licao-01', 'licao-02'],
      simulationCompleted: true,
      quizBestScore: QUIZ_PASSING_SCORE,
    })

    expect(calculateModuleProgress(module, progress)).toBe(100)
  })

  it('não deixa o percentual passar de 100 mesmo com lições duplicadas no array', () => {
    const module = buildModule({ totalLessons: 1 })
    const progress = buildProgress({ lessonsCompleted: ['licao-01', 'licao-01', 'licao-01'] })

    expect(calculateModuleProgress(module, progress)).toBeLessThanOrEqual(100)
  })
})
