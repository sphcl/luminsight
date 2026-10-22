import { describe, it, expect } from 'vitest'
import { Timestamp } from 'firebase/firestore'
import { calculateModuleProgress, calculateTrailProgress, getModuleStatus } from './trail'
import { QUIZ_PASSING_SCORE } from '@/constants/quiz'
import { CONTENT_MODULES } from '@/content'
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
    hasSimulation: true,
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

  it('marca como completed sem simulação quando o módulo não tem uma', () => {
    const module = buildModule({ totalLessons: 2, hasSimulation: false })
    const progressMap: ProgressMap = {
      'modulo-01': buildProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        quizBestScore: QUIZ_PASSING_SCORE,
      }),
    }

    expect(getModuleStatus(module, progressMap, [module])).toBe('completed')
  })

  it('não marca como completed sem simulação quando o módulo tem uma', () => {
    const module = buildModule({ totalLessons: 2, hasSimulation: true })
    const progressMap: ProgressMap = {
      'modulo-01': buildProgress({
        lessonsCompleted: ['licao-01', 'licao-02'],
        quizBestScore: QUIZ_PASSING_SCORE,
      }),
    }

    expect(getModuleStatus(module, progressMap, [module])).toBe('in_progress')
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

  it('não conta simulação como etapa em módulo sem simulação', () => {
    const module = buildModule({ totalLessons: 2, hasSimulation: false })
    const progress = buildProgress({
      lessonsCompleted: ['licao-01', 'licao-02'],
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

describe('cadeia de dependências dos cinco módulos reais', () => {
  const modules: ModuleWithId[] = CONTENT_MODULES.map((entry) => ({
    ...entry.module,
    id: entry.id,
  }))

  function getModule(id: string): ModuleWithId {
    const found = modules.find((module) => module.id === id)
    if (!found) throw new Error(`módulo "${id}" não encontrado nos fixtures do teste`)
    return found
  }

  function completeProgress(lessonCount: number): ProgressDocument {
    return buildProgress({
      lessonsCompleted: Array.from({ length: lessonCount }, (_, index) => `licao-0${index + 1}`),
      simulationCompleted: true,
      quizBestScore: QUIZ_PASSING_SCORE,
    })
  }

  it('libera cada módulo só depois do anterior estar completo', () => {
    const modulo01 = getModule('modulo-01')
    const modulo02 = getModule('modulo-02')
    const modulo03 = getModule('modulo-03')
    const progressMap: ProgressMap = {}

    expect(getModuleStatus(modulo01, progressMap, modules)).toBe('available')
    expect(getModuleStatus(modulo02, progressMap, modules)).toBe('locked')

    progressMap['modulo-01'] = completeProgress(modulo01.totalLessons)
    expect(getModuleStatus(modulo02, progressMap, modules)).toBe('available')
    expect(getModuleStatus(modulo03, progressMap, modules)).toBe('locked')
  })

  it('libera o módulo 2 com o módulo 1 completo sem simulação', () => {
    const progressMap: ProgressMap = {
      'modulo-01': buildProgress({
        lessonsCompleted: Array.from(
          { length: getModule('modulo-01').totalLessons },
          (_, index) => `licao-0${index + 1}`
        ),
        quizBestScore: QUIZ_PASSING_SCORE,
      }),
    }

    expect(getModuleStatus(getModule('modulo-02'), progressMap, modules)).toBe('available')
  })

  it('libera o módulo 5 só quando todos os anteriores estão completos', () => {
    const progressMap: ProgressMap = {
      'modulo-01': completeProgress(getModule('modulo-01').totalLessons),
      'modulo-02': completeProgress(getModule('modulo-02').totalLessons),
      'modulo-03': completeProgress(getModule('modulo-03').totalLessons),
      'modulo-04': completeProgress(getModule('modulo-04').totalLessons),
    }

    expect(getModuleStatus(getModule('modulo-05'), progressMap, modules)).toBe('available')
  })

  it('a cadeia de requiredModuleId vai do 1 ao 5 sem pular nem repetir', () => {
    const chain = ['modulo-01', 'modulo-02', 'modulo-03', 'modulo-04', 'modulo-05']

    chain.forEach((id, index) => {
      expect(getModule(id).requiredModuleId).toBe(index === 0 ? null : chain[index - 1])
      expect(getModule(id).isActive).toBe(true)
    })
  })

  it('módulo 5 sem simulação conclui com lições e quiz aprovado', () => {
    const modulo05 = getModule('modulo-05')
    expect(modulo05.hasSimulation).toBe(false)

    const progressMap: ProgressMap = {
      'modulo-01': completeProgress(getModule('modulo-01').totalLessons),
      'modulo-02': completeProgress(getModule('modulo-02').totalLessons),
      'modulo-03': completeProgress(getModule('modulo-03').totalLessons),
      'modulo-04': completeProgress(getModule('modulo-04').totalLessons),
      'modulo-05': buildProgress({
        lessonsCompleted: ['licao-01', 'licao-02', 'licao-03'],
        quizBestScore: QUIZ_PASSING_SCORE,
      }),
    }

    expect(getModuleStatus(modulo05, progressMap, modules)).toBe('completed')
    expect(calculateModuleProgress(modulo05, progressMap['modulo-05'])).toBe(100)
  })

  it('com os cinco módulos concluídos a trilha fecha: tudo completed, nada bloqueado', () => {
    const progressMap: ProgressMap = Object.fromEntries(
      modules.map((module) => [module.id, completeProgress(module.totalLessons)])
    )

    expect(modules.map((module) => getModuleStatus(module, progressMap, modules))).toEqual(
      modules.map(() => 'completed')
    )
    expect(calculateTrailProgress(modules, progressMap)).toBe(100)
  })
})

describe('calculateTrailProgress', () => {
  it('retorna 0 sem módulos', () => {
    expect(calculateTrailProgress([], {})).toBe(0)
  })

  it('soma as etapas de todos os módulos em vez de tirar média', () => {
    // 3 lições + quiz + simulação = 5 etapas; 1 lição + quiz = 2 etapas; total 7
    const big = buildModule({ id: 'modulo-01', totalLessons: 3, hasSimulation: true })
    const small = buildModule({ id: 'modulo-02', totalLessons: 1, hasSimulation: false })
    const progressMap: ProgressMap = {
      'modulo-02': buildProgress({ lessonsCompleted: ['l1'], quizBestScore: QUIZ_PASSING_SCORE }),
    }

    // Média dos módulos daria 50%, somando etapas dá 2 de 7
    expect(calculateTrailProgress([big, small], progressMap)).toBe(29)
  })

  it('retorna 100 com a trilha toda concluída', () => {
    const module = buildModule({ totalLessons: 1, hasSimulation: true })
    const progressMap: ProgressMap = {
      [module.id]: buildProgress({
        lessonsCompleted: ['l1'],
        quizBestScore: 100,
        simulationCompleted: true,
      }),
    }

    expect(calculateTrailProgress([module], progressMap)).toBe(100)
  })
})
