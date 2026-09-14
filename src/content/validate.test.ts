import { describe, it, expect } from 'vitest'
import { getContentCompletionReport, hasPendingText, validateContent } from './validate'
import { CONTENT_MODULES, CONTENT_SIMULATIONS, type ContentModuleEntry } from './index'
import type { LessonEntry } from './types'
import type { ModuleDocument } from '@/types/module.types'
import type { QuizQuestion } from '@/types/quiz.types'
import type { SimulationDocument } from '@/types/simulation.types'

function buildModule(overrides: Partial<ModuleDocument> = {}): ModuleDocument {
  return {
    title: 'Módulo',
    description: 'Descrição',
    order: 1,
    icon: 'placeholder',
    color: 'primary',
    difficulty: 'iniciante',
    estimatedMinutes: 10,
    totalLessons: 1,
    isActive: false,
    requiredModuleId: null,
    ...overrides,
  }
}

function buildLesson(overrides: Partial<LessonEntry> = {}): LessonEntry {
  return {
    id: 'licao-01',
    data: { title: 'Lição', order: 1, content: [], estimatedMinutes: 5, readingTimeSeconds: 60 },
    ...overrides,
  }
}

function buildQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: 'q1',
    type: 'multiple_choice',
    prompt: 'Prompt',
    options: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ],
    correctOptionId: 'a',
    explanation: 'Explicação',
    ...overrides,
  }
}

function buildQuiz(): QuizQuestion[] {
  return Array.from({ length: 10 }, (_, index) => buildQuestion({ id: `q${index + 1}` }))
}

function buildEntry(overrides: Partial<ContentModuleEntry> = {}): ContentModuleEntry {
  return {
    id: 'modulo-01',
    module: buildModule(),
    lessons: [buildLesson()],
    quiz: buildQuiz(),
    ...overrides,
  }
}

function buildSimulation(overrides: Partial<SimulationDocument> = {}): SimulationDocument {
  return {
    id: 'simulacao-01',
    moduleId: 'modulo-01',
    title: 'Simulação',
    description: 'Descrição',
    format: 'chat',
    estimatedMinutes: 10,
    scenes: [
      {
        id: 'cena-01',
        order: 1,
        messages: [{ sender: 'attacker', content: 'Mensagem' }],
        decision: {
          prompt: 'Prompt',
          options: [
            { id: 'a', text: 'A', isCorrect: true, feedback: 'Feedback' },
            { id: 'b', text: 'B', isCorrect: false, feedback: 'Feedback' },
          ],
        },
      },
    ],
    ...overrides,
  }
}

describe('hasPendingText', () => {
  it('detecta o marcador em string simples', () => {
    expect(hasPendingText('[PENDENTE] texto')).toBe(true)
  })

  it('detecta o marcador dentro de array e objeto aninhado', () => {
    expect(hasPendingText([{ content: '[PENDENTE] texto' }])).toBe(true)
  })

  it('retorna false quando não há marcador', () => {
    expect(hasPendingText({ title: 'Título normal', items: ['a', 'b'] })).toBe(false)
  })
})

describe('validateContent', () => {
  it('os cinco módulos e simulações reais passam na validação', () => {
    expect(validateContent(CONTENT_MODULES, CONTENT_SIMULATIONS)).toEqual([])
  })

  it('acusa lacuna na ordem dos módulos', () => {
    const modules = [buildEntry({ id: 'modulo-01', module: buildModule({ order: 1 }) }), buildEntry({ id: 'modulo-03', module: buildModule({ order: 3 }) })]
    expect(validateContent(modules, [])).not.toEqual([])
  })

  it('acusa duplicata na ordem dos módulos', () => {
    const modules = [buildEntry({ id: 'modulo-01', module: buildModule({ order: 1 }) }), buildEntry({ id: 'modulo-02', module: buildModule({ order: 1 }) })]
    expect(validateContent(modules, [])).not.toEqual([])
  })

  it('acusa totalLessons que não bate com o número real de lições', () => {
    const entry = buildEntry({ module: buildModule({ totalLessons: 2 }), lessons: [buildLesson()] })
    expect(validateContent([entry], [])).not.toEqual([])
  })

  it('acusa quiz sem exatamente 10 questões', () => {
    const entry = buildEntry({ quiz: [buildQuestion()] })
    expect(validateContent([entry], [])).not.toEqual([])
  })

  it('acusa correctOptionId que não existe entre as options', () => {
    const entry = buildEntry({ quiz: [buildQuestion({ correctOptionId: 'inexistente' }), ...buildQuiz().slice(1)] })
    expect(validateContent([entry], [])).not.toEqual([])
  })

  it('acusa option duplicada dentro da mesma questão', () => {
    const question = buildQuestion({
      options: [
        { id: 'a', text: 'A' },
        { id: 'a', text: 'A duplicada' },
      ],
    })
    const entry = buildEntry({ quiz: [question, ...buildQuiz().slice(1)] })
    expect(validateContent([entry], [])).not.toEqual([])
  })

  it('acusa ciclo na cadeia de requiredModuleId', () => {
    const moduleA = buildEntry({ id: 'modulo-A', module: buildModule({ order: 1, requiredModuleId: 'modulo-B' }) })
    const moduleB = buildEntry({ id: 'modulo-B', module: buildModule({ order: 2, requiredModuleId: 'modulo-A' }) })
    expect(validateContent([moduleA, moduleB], [])).not.toEqual([])
  })

  it('acusa requiredModuleId apontando para módulo inexistente', () => {
    const entry = buildEntry({ module: buildModule({ requiredModuleId: 'modulo-fantasma' }) })
    expect(validateContent([entry], [])).not.toEqual([])
  })

  it('acusa simulação com decisão sem nenhuma opção correta', () => {
    const simulation = buildSimulation({
      scenes: [
        {
          id: 'cena-01',
          order: 1,
          messages: [],
          decision: {
            prompt: 'Prompt',
            options: [{ id: 'a', text: 'A', isCorrect: false, feedback: 'Feedback' }],
          },
        },
      ],
    })
    expect(validateContent([], [simulation])).not.toEqual([])
  })

  it('reprova módulo com [PENDENTE] e isActive: true', () => {
    const entry = buildEntry({
      module: buildModule({ isActive: true, description: '[PENDENTE] texto' }),
    })
    expect(validateContent([entry], [])).not.toEqual([])
  })

  it('aceita módulo com [PENDENTE] enquanto isActive: false', () => {
    const entry = buildEntry({
      module: buildModule({ isActive: false, description: '[PENDENTE] texto' }),
    })
    expect(validateContent([entry], [])).toEqual([])
  })
})

describe('getContentCompletionReport', () => {
  it('conta blocos de conteúdo e questões pendentes por módulo', () => {
    const entry = buildEntry({
      lessons: [
        buildLesson({
          data: {
            title: 'Lição',
            order: 1,
            estimatedMinutes: 5,
            readingTimeSeconds: 60,
            content: [
              { type: 'text', content: '[PENDENTE] texto' },
              { type: 'text', content: 'Texto real' },
            ],
          },
        }),
      ],
      quiz: [buildQuestion({ prompt: '[PENDENTE] pergunta' }), ...buildQuiz().slice(1)],
    })

    const [report] = getContentCompletionReport([entry])

    expect(report).toEqual({
      moduleId: 'modulo-01',
      totalContentBlocks: 2,
      pendingContentBlocks: 1,
      totalQuizQuestions: 10,
      pendingQuizQuestions: 1,
    })
  })
})
