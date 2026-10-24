import { CONTENT_MODULES, CONTENT_SIMULATIONS } from '../../src/content'
import { SECURITY_KNOWLEDGE_OPTIONS } from '../../src/features/onboarding/schemas/onboarding.schema'
import { RISK_PERCEPTION_OPTIONS } from '../../src/features/research/schemas/research.schema'
import type { Analysis, Participant, QuizAttempt, SimulationAttempt } from './analyze'

export interface Mean {
  value: number | null
  n: number
}

export interface Rate {
  correct: number
  total: number
  people: number
}

export interface PrePost {
  levels: string[]
  before: Map<string, number>
  after: Map<string, number>
  up: number
  down: number
  same: number
  n: number
}

export interface Summary {
  participants: number
  trailCompleted: number
  trailNotCompleted: number
  stoppedAt: Map<string, number>
  quizByModule: Array<{ moduleId: string; first: Mean; best: Mean; attempts: Mean }>
  quizOverall: { first: Mean; best: Mean }
  simulations: Array<{
    simulationId: string
    concluded: number
    rate: Rate
    scenes: Array<{ sceneId: string; rate: Rate }>
  }>
  knowledge: PrePost
  risk: PrePost
}

export const NOT_STARTED = 'não começou'

export function mean(values: number[]): Mean {
  if (values.length === 0) return { value: null, n: 0 }
  return { value: values.reduce((sum, value) => sum + value, 0) / values.length, n: values.length }
}

function groupBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) groups.set(keyOf(item), [...(groups.get(keyOf(item)) ?? []), item])
  return groups
}

// "Onde parou" é o primeiro módulo da trilha ainda sem conclusão.
export function stoppingPoint(participant: Participant): string {
  if (participant.progress.length === 0) return NOT_STARTED
  const pending = CONTENT_MODULES.find(
    (entry) =>
      !participant.progress.some(
        (progress) => progress.moduleId === entry.id && progress.completedAt
      )
  )
  return pending?.id ?? NOT_STARTED
}

function quizMeans(attempts: QuizAttempt[]): { first: number[]; best: number[] } {
  const perPerson = [...groupBy(attempts, (attempt) => attempt.participantId).values()]
  return {
    first: perPerson.map(
      (list) => list.find((attempt) => attempt.attempt === 1)?.score ?? list[0]!.score
    ),
    best: perPerson.map((list) => Math.max(...list.map((attempt) => attempt.score))),
  }
}

// Só a primeira tentativa de cada pessoa: quem refaz já conhece o caminho, e o que interessa é a reação inicial.
function firstAttempts(attempts: SimulationAttempt[]): SimulationAttempt[] {
  return attempts.filter((attempt) => attempt.attempt === 1)
}

function rateOf(decisions: Array<{ correct: boolean | null }>, people: number): Rate {
  const known = decisions.filter((decision) => decision.correct !== null)
  return {
    correct: known.filter((decision) => decision.correct).length,
    total: known.length,
    people,
  }
}

export function prePost(
  levels: string[],
  pairs: Array<{ before: string; after: string }>
): PrePost {
  const result: PrePost = {
    levels,
    before: new Map(),
    after: new Map(),
    up: 0,
    down: 0,
    same: 0,
    n: 0,
  }
  for (const { before, after } of pairs) {
    const from = levels.indexOf(before)
    const to = levels.indexOf(after)
    if (from === -1 || to === -1) continue
    result.n++
    result.before.set(before, (result.before.get(before) ?? 0) + 1)
    result.after.set(after, (result.after.get(after) ?? 0) + 1)
    if (to > from) result.up++
    else if (to < from) result.down++
    else result.same++
  }
  return result
}

export function computeSummary(analysis: Analysis): Summary {
  const { participants, quizAttempts, simulationAttempts } = analysis
  const notCompleted = participants.filter((participant) => !participant.trailCompleted)
  const stoppedAt = new Map<string, number>()
  for (const participant of notCompleted) {
    const point = stoppingPoint(participant)
    stoppedAt.set(point, (stoppedAt.get(point) ?? 0) + 1)
  }

  const quizByModule = CONTENT_MODULES.map(({ id }) => {
    const attempts = quizAttempts.filter((attempt) => attempt.moduleId === id)
    const { first, best } = quizMeans(attempts)
    const perPerson = [...groupBy(attempts, (attempt) => attempt.participantId).values()]
    return {
      moduleId: id,
      first: mean(first),
      best: mean(best),
      attempts: mean(perPerson.map((list) => list.length)),
    }
  })
  const overall = CONTENT_MODULES.map(({ id }) =>
    quizMeans(quizAttempts.filter((attempt) => attempt.moduleId === id))
  )

  const simulations = CONTENT_SIMULATIONS.map((simulation) => {
    const first = firstAttempts(
      simulationAttempts.filter((attempt) => attempt.simulationId === simulation.id)
    )
    const decisions = first.flatMap((attempt) => attempt.decisions)
    return {
      simulationId: simulation.id,
      concluded: participants.filter((participant) =>
        participant.progress.some(
          (entry) => entry.moduleId === simulation.moduleId && entry.simulationCompleted
        )
      ).length,
      rate: rateOf(decisions, first.length),
      scenes: simulation.scenes.map((scene) => {
        const reached = first.filter((attempt) =>
          attempt.decisions.some((decision) => decision.sceneId === scene.id)
        )
        return {
          sceneId: scene.id,
          rate: rateOf(
            decisions.filter((decision) => decision.sceneId === scene.id),
            reached.length
          ),
        }
      }),
    }
  })

  // Conhecimento de antes vale pra todo mundo (perguntado no onboarding); risco só pro grupo antes_do_uso.
  const knowledge = prePost(
    SECURITY_KNOWLEDGE_OPTIONS.map((option) => option.value),
    participants.flatMap((participant) =>
      participant.user.onboardingProfile && participant.feedback
        ? [
            {
              before: participant.user.onboardingProfile.securityKnowledge,
              after: participant.feedback.securityKnowledge,
            },
          ]
        : []
    )
  )
  const risk = prePost(
    RISK_PERCEPTION_OPTIONS.map((option) => option.value),
    participants.flatMap((participant) =>
      participant.baselineGroup === 'antes_do_uso' &&
      participant.user.riskBaseline &&
      participant.feedback
        ? [
            {
              before: participant.user.riskBaseline.riskPerception,
              after: participant.feedback.riskPerception,
            },
          ]
        : []
    )
  )

  return {
    participants: participants.length,
    trailCompleted: participants.length - notCompleted.length,
    trailNotCompleted: notCompleted.length,
    stoppedAt,
    quizByModule,
    quizOverall: {
      first: mean(overall.flatMap((entry) => entry.first)),
      best: mean(overall.flatMap((entry) => entry.best)),
    },
    simulations,
    knowledge,
    risk,
  }
}

function formatMean({ value, n }: Mean, unit = ''): string {
  return value === null ? 'sem dados (n=0)' : `${value.toFixed(1)}${unit} (n=${n})`
}

function formatRate({ correct, total, people }: Rate): string {
  if (total === 0) return 'sem dados (n=0)'
  return `${Math.round((correct / total) * 100)}% (${correct} de ${total} decisões, n=${people} pessoas)`
}

function formatPrePost(title: string, data: PrePost): string[] {
  if (data.n === 0) return [`${title}: sem dados (n=0)`]
  return [
    `${title} (n=${data.n} pessoas com antes e depois válidos):`,
    ...data.levels.map(
      (level) =>
        `  ${level}: antes ${data.before.get(level) ?? 0}, depois ${data.after.get(level) ?? 0}`
    ),
    `  subiu ${data.up}, desceu ${data.down}, ficou igual ${data.same}`,
  ]
}

export function formatSummary(analysis: Analysis, summary: Summary): string {
  const { loss, quizDivergence, decisionDivergence } = analysis
  const count = (status: Parameters<typeof analysis.statusCounts.get>[0]) =>
    analysis.statusCounts.get(status) ?? 0
  return [
    'EXCLUSÕES',
    `  incluídas: ${count('incluido')}`,
    `  sem decisão (conta antiga que ainda não respondeu o aviso): ${count('sem_decisao')}`,
    `  recusaram: ${count('recusou')}`,
    `  revogaram: ${count('revogou')} (inferido e aproximado: quem aceitou e revogou sem gravar nada conta como recusa)`,
    `  lista de exclusão: ${count('lista_exclusao')}`,
    '',
    'CONFERÊNCIA DE PERDA (simulação concluída sem registro em simulationResults)',
    `  aceite no onboarding, exata: ${loss.exact.missing} de ${loss.exact.expected}`,
    `  aceite depois de usar, APROXIMADA: ${loss.approximate.missing} de ${loss.approximate.expected} (inclui simulações concluídas antes do aceite, que não são perda)`,
    '',
    'DIVERGÊNCIA ENTRE ACERTO GRAVADO E RECALCULADO PELO GABARITO',
    `  respostas de quiz: ${quizDivergence.divergent} de ${quizDivergence.checked} (${quizDivergence.unknown} sem questão no conteúdo atual)`,
    `  decisões de simulação: ${decisionDivergence.divergent} de ${decisionDivergence.checked} (${decisionDivergence.unknown} sem cena no conteúdo atual)`,
    '',
    `TRILHA (n=${summary.participants})`,
    `  concluíram: ${summary.trailCompleted}`,
    `  não concluíram: ${summary.trailNotCompleted}`,
    ...[...summary.stoppedAt].map(([module, count]) => `    pararam em ${module}: ${count}`),
    '',
    'QUIZ (nota recalculada pelo gabarito)',
    ...summary.quizByModule.map(
      ({ moduleId, first, best, attempts }) =>
        `  ${moduleId}: primeira tentativa ${formatMean(first)}, melhor ${formatMean(best)}, tentativas por pessoa ${formatMean(attempts)}`
    ),
    `  geral: primeira tentativa ${formatMean(summary.quizOverall.first)}, melhor ${formatMean(summary.quizOverall.best)} (n = pessoa por módulo)`,
    '',
    'SIMULAÇÕES (acerto na primeira tentativa de cada pessoa)',
    ...summary.simulations.flatMap(({ simulationId, concluded, rate, scenes }) => [
      `  ${simulationId}: concluíram ${concluded} de ${summary.participants}, acerto ${formatRate(rate)}`,
      ...scenes.map(({ sceneId, rate: sceneRate }) => `    ${sceneId}: ${formatRate(sceneRate)}`),
    ]),
    '',
    'ANTES E DEPOIS (escalas ordinais: distribuição e movimento pareado, sem média)',
    ...formatPrePost('  nível de conhecimento', summary.knowledge),
    ...formatPrePost('  percepção de risco (só grupo antes_do_uso)', summary.risk),
  ].join('\n')
}
