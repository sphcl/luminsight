import { describe, it, expect } from 'vitest'
import { CONTENT_SIMULATIONS } from '../../src/content'
import { getQuizForModule } from '../../src/content/quizzes'
import { getCorrectOptionIds } from '../../src/features/quiz/engine/scoring'
import { analyze, FINAL_MODULE_ID } from './analyze'
import { classifyBaseline, classifyParticipation } from './eligibility'
import { toQuizResult } from './read-firestore'
import { computeSummary, formatSummary, mean, NOT_STARTED, prePost } from './summary'
import { buildTables, shuffle } from './tables'
import type {
  ExportDataset,
  ExportFeedback,
  ExportProgress,
  ExportQuizResult,
  ExportSimulationResult,
  ExportUser,
} from './types'

const id = (uid: string) => `id-${uid}`
const day = (iso: string) => new Date(`${iso}T12:00:00Z`)

function user(uid: string, overrides: Partial<ExportUser> = {}): ExportUser {
  return {
    uid,
    createdAt: day('2026-10-01'),
    onboardingProfile: {
      securityKnowledge: 'iniciante',
      scamExperience: 'nao',
      motivation: 'curiosidade',
    },
    researchConsent: {
      accepted: true,
      isAdult: true,
      decidedAt: day('2026-10-01'),
      version: 'onboarding-v2',
    },
    riskBaseline: { riskPerception: 'baixa', collectedAfterUse: false },
    ...overrides,
  }
}

function progress(
  uid: string,
  moduleId: string,
  overrides: Partial<ExportProgress> = {}
): ExportProgress {
  return {
    uid,
    moduleId,
    startedAt: day('2026-10-02'),
    completedAt: null,
    lessonsCompleted: 0,
    quizBestScore: null,
    quizAttempts: 0,
    simulationCompleted: false,
    ...overrides,
  }
}

const QUIZ_MODULE = 'modulo-01'
const question = getQuizForModule(QUIZ_MODULE)![0]!
const rightIds = getCorrectOptionIds(question)
const wrongId = question.options.find((option) => !rightIds.includes(option.id))!.id

function quizResult(
  uid: string,
  completedAt: string,
  right: boolean,
  storedCorrect = right
): ExportQuizResult {
  return {
    uid,
    moduleId: QUIZ_MODULE,
    completedAt: day(completedAt),
    timeSpentSeconds: 60,
    answers: [
      { questionId: question.id, selectedOptionIds: right ? rightIds : [wrongId], storedCorrect },
    ],
  }
}

const simulation = CONTENT_SIMULATIONS[0]!
const scene = simulation.scenes[0]!
const rightOption = scene.decision.options.find((option) => option.isCorrect)!
const wrongOption = scene.decision.options.find((option) => !option.isCorrect)!

function simulationResult(
  uid: string,
  right: boolean,
  storedCorrect = right
): ExportSimulationResult {
  return {
    uid,
    simulationId: simulation.id,
    moduleId: simulation.moduleId,
    completedAt: day('2026-10-05'),
    timeSpentSeconds: 90,
    decisions: [
      {
        sceneId: scene.id,
        selectedOptionId: (right ? rightOption : wrongOption).id,
        storedCorrect,
      },
    ],
  }
}

function feedback(uid: string, overrides: Partial<ExportFeedback> = {}): ExportFeedback {
  return {
    uid,
    securityKnowledge: 'intermediario',
    riskPerception: 'alta',
    satisfaction: 'gostei',
    mostUseful: ['simulacoes'],
    comment: null,
    ...overrides,
  }
}

function dataset(overrides: Partial<ExportDataset> = {}): ExportDataset {
  return {
    users: [],
    progress: [],
    quizResults: [],
    simulationResults: [],
    feedback: [],
    ...overrides,
  }
}

const run = (data: ExportDataset, excluded: string[] = []) => analyze(data, new Set(excluded), id)

describe('quem entra na exportação', () => {
  it.each([
    ['sem decisão', user('a', { researchConsent: null }), false, 'sem_decisao'],
    [
      'recusou',
      user('a', {
        researchConsent: {
          accepted: false,
          isAdult: false,
          decidedAt: null,
          version: 'onboarding-v2',
        },
      }),
      false,
      'recusou',
    ],
    [
      'revogou (tem dado de pesquisa gravado)',
      user('a', {
        researchConsent: {
          accepted: false,
          isAdult: true,
          decidedAt: null,
          version: 'retroativo-v2',
        },
      }),
      true,
      'revogou',
    ],
    ['aceitou', user('a'), false, 'incluido'],
  ])('%s', (_, account, hasData, expected) => {
    expect(classifyParticipation(account, new Set(), hasData)).toBe(expected)
  })

  it('lista de exclusão vence até quem aceitou', () => {
    expect(classifyParticipation(user('a'), new Set(['a']), false)).toBe('lista_exclusao')
  })

  it('quem revogou sai por completo, inclusive o que gravou antes de revogar', () => {
    const revoked = user('r', {
      researchConsent: {
        accepted: false,
        isAdult: true,
        decidedAt: day('2026-10-10'),
        version: 'retroativo-v2',
      },
    })
    const analysis = run(
      dataset({
        users: [user('a'), revoked, user('equipe')],
        quizResults: [
          quizResult('r', '2026-10-03', true),
          quizResult('equipe', '2026-10-03', true),
        ],
        simulationResults: [simulationResult('r', true)],
        feedback: [feedback('r', { comment: 'comentário de quem revogou' })],
      }),
      ['equipe']
    )

    expect(analysis.participants.map((participant) => participant.user.uid)).toEqual(['a'])
    expect(analysis.quizAttempts).toEqual([])
    expect(analysis.simulationAttempts).toEqual([])
    expect(analysis.comments).toEqual([])
    expect(analysis.statusCounts.get('revogou')).toBe(1)
    expect(analysis.statusCounts.get('lista_exclusao')).toBe(1)
  })
})

describe('grupo da linha de base', () => {
  it('antes do uso, depois de usar sem concluir e depois de concluir', () => {
    const late = (decidedAt: string) =>
      user('a', {
        riskBaseline: { riskPerception: 'alta', collectedAfterUse: true },
        researchConsent: {
          accepted: true,
          isAdult: true,
          decidedAt: day(decidedAt),
          version: 'retroativo-v2',
        },
      })

    expect(classifyBaseline(user('a'), null)).toBe('antes_do_uso')
    expect(classifyBaseline(late('2026-10-10'), null)).toBe('depois_de_usar_sem_concluir')
    expect(classifyBaseline(late('2026-10-10'), day('2026-10-20'))).toBe(
      'depois_de_usar_sem_concluir'
    )
    expect(classifyBaseline(late('2026-10-10'), day('2026-10-05'))).toBe('depois_de_concluir')
    expect(classifyBaseline(user('a', { riskBaseline: null }), null)).toBe('sem_linha_de_base')
  })
})

describe('recálculo pelo gabarito e divergência', () => {
  it('exporta o acerto recalculado e conta quem gravou diferente', () => {
    const analysis = run(
      dataset({
        users: [user('a')],
        quizResults: [quizResult('a', '2026-10-03', false, true)],
        simulationResults: [simulationResult('a', false, true)],
      })
    )

    expect(analysis.quizAttempts[0]?.answers[0]?.correct).toBe(false)
    expect(analysis.quizAttempts[0]?.score).toBe(0)
    expect(analysis.quizDivergence).toEqual({ checked: 1, divergent: 1, unknown: 0 })
    expect(analysis.decisionDivergence).toEqual({ checked: 1, divergent: 1, unknown: 0 })
  })

  it('questão que não existe mais no conteúdo fica sem acerto e conta à parte', () => {
    const result = quizResult('a', '2026-10-03', true)
    result.answers[0]!.questionId = 'questao-apagada'
    const analysis = run(dataset({ users: [user('a')], quizResults: [result] }))

    expect(analysis.quizAttempts[0]?.answers[0]?.correct).toBeNull()
    expect(analysis.quizDivergence).toEqual({ checked: 0, divergent: 0, unknown: 1 })
  })

  it('numera as tentativas pela ordem de conclusão', () => {
    const analysis = run(
      dataset({
        users: [user('a')],
        quizResults: [quizResult('a', '2026-10-09', true), quizResult('a', '2026-10-03', false)],
      })
    )

    expect(analysis.quizAttempts.map((attempt) => [attempt.attempt, attempt.score])).toEqual([
      [1, 0],
      [2, 100],
    ])
  })

  it('lê a resposta antiga, que guardava uma alternativa só', () => {
    const converted = toQuizResult({
      userId: 'a',
      moduleId: QUIZ_MODULE,
      answers: [{ questionId: 'q1', selectedOptionId: 'b', correct: true }],
    })
    expect(converted.answers[0]?.selectedOptionIds).toEqual(['b'])
  })
})

describe('conferência de perda', () => {
  it('é exata pra quem aceitou no onboarding e aproximada pra quem aceitou depois', () => {
    const late = user('late', {
      researchConsent: {
        accepted: true,
        isAdult: true,
        decidedAt: day('2026-10-10'),
        version: 'retroativo-v2',
      },
    })
    const analysis = run(
      dataset({
        users: [user('a'), late],
        progress: [
          progress('a', simulation.moduleId, { simulationCompleted: true }),
          progress('late', simulation.moduleId, { simulationCompleted: true }),
        ],
      })
    )

    expect(analysis.loss).toEqual({
      exact: { expected: 1, missing: 1 },
      approximate: { expected: 1, missing: 1 },
    })
    expect(formatSummary(analysis, computeSummary(analysis))).toMatch(/APROXIMADA/)
  })

  it('não acusa perda quando o registro existe', () => {
    const analysis = run(
      dataset({
        users: [user('a')],
        progress: [progress('a', simulation.moduleId, { simulationCompleted: true })],
        simulationResults: [simulationResult('a', true)],
      })
    )
    expect(analysis.loss.exact).toEqual({ expected: 1, missing: 0 })
  })
})

describe('métricas', () => {
  it('amostra vazia não vira número', () => {
    const analysis = run(dataset())
    const summary = computeSummary(analysis)

    expect(mean([])).toEqual({ value: null, n: 0 })
    expect(summary.participants).toBe(0)
    expect(formatSummary(analysis, summary)).toMatch(/sem dados \(n=0\)/)
  })

  it('amostra de um mostra n=1 junto da média', () => {
    const analysis = run(
      dataset({ users: [user('a')], quizResults: [quizResult('a', '2026-10-03', true)] })
    )
    const summary = computeSummary(analysis)

    expect(summary.quizByModule.find((entry) => entry.moduleId === QUIZ_MODULE)?.first).toEqual({
      value: 100,
      n: 1,
    })
    expect(formatSummary(analysis, summary)).toMatch(/primeira tentativa 100\.0 \(n=1\)/)
  })

  it('quem nunca começou aparece como "não começou", e quem concluiu a trilha não entra em onde parou', () => {
    const analysis = run(
      dataset({
        users: [user('a'), user('b'), user('c')],
        progress: [
          progress('b', 'modulo-01', { completedAt: day('2026-10-03') }),
          progress('c', FINAL_MODULE_ID, { completedAt: day('2026-10-20') }),
        ],
      })
    )
    const summary = computeSummary(analysis)

    expect(summary.trailCompleted).toBe(1)
    expect(summary.stoppedAt.get(NOT_STARTED)).toBe(1)
    expect(summary.stoppedAt.get('modulo-02')).toBe(1)
  })

  it('antes e depois por movimento pareado, sem média', () => {
    const result = prePost(
      ['muito_baixa', 'baixa', 'alta', 'muito_alta'],
      [
        { before: 'baixa', after: 'alta' },
        { before: 'alta', after: 'alta' },
        { before: 'muito_alta', after: 'baixa' },
      ]
    )
    expect([result.up, result.same, result.down, result.n]).toEqual([1, 1, 1, 3])
    expect(result.before.get('baixa')).toBe(1)
  })

  it('percepção de risco só compara quem tem linha de base de antes do uso', () => {
    const late = user('late', { riskBaseline: { riskPerception: 'alta', collectedAfterUse: true } })
    const analysis = run(
      dataset({ users: [user('a'), late], feedback: [feedback('a'), feedback('late')] })
    )
    const summary = computeSummary(analysis)

    expect(summary.risk.n).toBe(1)
    expect(summary.knowledge.n).toBe(2)
  })
})

describe('tabelas', () => {
  it('comentários saem sem identificador e protegidos contra fórmula', () => {
    const analysis = run(
      dataset({ users: [user('a')], feedback: [feedback('a', { comment: '=chamar()' })] })
    )
    const comments = buildTables(analysis).find((table) => table.file === 'comentarios.csv')!

    expect(comments.header).toEqual(['comentario'])
    expect(comments.rows).toEqual([['=chamar()']])
  })

  it('usuarios.csv tem só a data de criação e o grupo da linha de base em coluna própria', () => {
    const analysis = run(dataset({ users: [user('a')] }))
    const table = buildTables(analysis).find((entry) => entry.file === 'usuarios.csv')!
    const row = Object.fromEntries(
      table.header.map((column, index) => [column, table.rows[0]?.at(index)])
    )

    expect(row.participante).toBe('id-a')
    expect(row.criado_em).toBe('2026-10-01')
    expect(row.grupo_linha_de_base).toBe('antes_do_uso')
    expect(table.header).not.toContain('email')
  })

  it('embaralha pela chave sorteada', () => {
    const keys = [3, 1, 2]
    expect(shuffle(['a', 'b', 'c'], () => keys.shift()!)).toEqual(['b', 'c', 'a'])
  })
})
