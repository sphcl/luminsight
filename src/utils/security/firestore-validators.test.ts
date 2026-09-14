import { describe, it, expect } from 'vitest'
import { Timestamp } from 'firebase/firestore'
import { parseModule, parseLesson, parseProgress } from './firestore-validators'

const validModule = {
  title: 'Módulo 4',
  description: 'Descrição',
  order: 4,
  icon: 'shield',
  color: '#123456',
  difficulty: 'intermediario',
  estimatedMinutes: 30,
  totalLessons: 3,
  isActive: true,
  requiredModuleId: 'modulo-03',
}

const validLesson = {
  title: 'Lição 1',
  order: 1,
  content: [{ type: 'text', content: 'Olá' }],
  estimatedMinutes: 10,
  readingTimeSeconds: 120,
}

const now = Timestamp.now()

const validProgress = {
  startedAt: now,
  completedAt: null,
  lessonsCompleted: ['licao-01'],
  quizBestScore: null,
  quizAttempts: 0,
  simulationCompleted: false,
  lastUpdatedAt: now,
}

describe('parseModule', () => {
  it('aceita um módulo válido', () => {
    expect(parseModule(validModule)).toEqual(validModule)
  })

  it('rejeita quando falta um campo obrigatório', () => {
    const { totalLessons, ...withoutTotalLessons } = validModule
    expect(parseModule(withoutTotalLessons)).toBeNull()
  })

  it('rejeita quando um campo tem o tipo errado', () => {
    expect(parseModule({ ...validModule, order: '4' })).toBeNull()
  })

  it('rejeita difficulty fora do enum permitido', () => {
    expect(parseModule({ ...validModule, difficulty: 'expert' })).toBeNull()
  })

  it('rejeita valores completamente fora de forma (null, array, string)', () => {
    expect(parseModule(null)).toBeNull()
    expect(parseModule([])).toBeNull()
    expect(parseModule('modulo')).toBeNull()
  })
})

describe('parseLesson', () => {
  it('aceita uma lição válida', () => {
    expect(parseLesson(validLesson)).toEqual(validLesson)
  })

  it('rejeita quando falta um campo obrigatório', () => {
    const { estimatedMinutes, ...withoutEstimatedMinutes } = validLesson
    expect(parseLesson(withoutEstimatedMinutes)).toBeNull()
  })

  it('rejeita ContentBlock com type desconhecido', () => {
    expect(
      parseLesson({
        ...validLesson,
        content: [{ type: 'video', url: 'https://example.com' }],
      })
    ).toBeNull()
  })

  it('rejeita highlight sem variant', () => {
    expect(
      parseLesson({
        ...validLesson,
        content: [{ type: 'highlight', content: 'Atenção' }],
      })
    ).toBeNull()
  })

  it('aceita todos os tipos de ContentBlock', () => {
    const content = [
      { type: 'text', content: 'texto' },
      { type: 'heading', content: 'título' },
      { type: 'highlight', content: 'aviso', variant: 'warning' },
      { type: 'list', items: ['a', 'b'], ordered: false },
      { type: 'example', title: 'Exemplo', content: 'conteúdo' },
      { type: 'fact', content: 'fato', source: 'fonte' },
    ]
    expect(parseLesson({ ...validLesson, content })).not.toBeNull()
  })
})

describe('parseProgress', () => {
  it('aceita um progresso válido', () => {
    expect(parseProgress(validProgress)).toEqual(validProgress)
  })

  it('rejeita quando falta um campo obrigatório', () => {
    const { quizAttempts, ...withoutQuizAttempts } = validProgress
    expect(parseProgress(withoutQuizAttempts)).toBeNull()
  })

  it('rejeita startedAt que não seja um Timestamp do Firestore', () => {
    expect(parseProgress({ ...validProgress, startedAt: new Date().toISOString() })).toBeNull()
  })

  it('aceita completedAt nulo mas rejeita completedAt com tipo errado', () => {
    expect(parseProgress(validProgress)).not.toBeNull()
    expect(parseProgress({ ...validProgress, completedAt: 'agora' })).toBeNull()
  })
})
