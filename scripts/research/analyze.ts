import { CONTENT_MODULES } from '../../src/content'
import {
  classifyBaseline,
  classifyParticipation,
  researchDataOwners,
  type BaselineGroup,
  type ParticipationStatus,
} from './eligibility'
import { assignPseudonyms } from './pseudonym'
import { regradeDecision, regradeQuizAnswer, scoreOf } from './regrade'
import type {
  ExportDataset,
  ExportFeedback,
  ExportProgress,
  ExportQuizAnswer,
  ExportDecision,
  ExportUser,
} from './types'

export interface Participant {
  id: string
  user: ExportUser
  baselineGroup: BaselineGroup
  trailCompleted: boolean
  progress: ExportProgress[]
  feedback: ExportFeedback | null
}

export interface GradedAnswer extends ExportQuizAnswer {
  correct: boolean | null
}

export interface QuizAttempt {
  participantId: string
  moduleId: string
  attempt: number
  completedAt: Date | null
  timeSpentSeconds: number
  answers: GradedAnswer[]
  correct: number
  total: number
  score: number
}

export interface GradedDecision extends ExportDecision {
  order: number
  correct: boolean | null
}

export interface SimulationAttempt {
  participantId: string
  simulationId: string
  moduleId: string
  attempt: number
  completedAt: Date | null
  timeSpentSeconds: number
  decisions: GradedDecision[]
  correct: number
}

export interface Divergence {
  checked: number
  divergent: number
  unknown: number
}

export interface LossCheck {
  expected: number
  missing: number
}

export interface Analysis {
  participants: Participant[]
  statusCounts: Map<ParticipationStatus, number>
  quizAttempts: QuizAttempt[]
  simulationAttempts: SimulationAttempt[]
  quizDivergence: Divergence
  decisionDivergence: Divergence
  // Exata pra quem aceitou no onboarding; aproximada pra quem aceitou depois (docs/modelagem.md).
  loss: { exact: LossCheck; approximate: LossCheck }
  comments: string[]
}

export const FINAL_MODULE_ID = CONTENT_MODULES[CONTENT_MODULES.length - 1]?.id ?? ''

function byCompletion<T extends { completedAt: Date | null }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (a.completedAt?.getTime() ?? 0) - (b.completedAt?.getTime() ?? 0)
  )
}

// Tentativa não é gravada: numero por ordem de conclusão, por pessoa e por módulo ou simulação.
function numberAttempts<T extends { completedAt: Date | null }>(
  items: T[],
  keyOf: (item: T) => string
): Array<T & { attempt: number }> {
  const counters = new Map<string, number>()
  return byCompletion(items).map((item) => {
    const key = keyOf(item)
    const attempt = (counters.get(key) ?? 0) + 1
    counters.set(key, attempt)
    return { ...item, attempt }
  })
}

function tally(divergence: Divergence, stored: boolean, recalculated: boolean | null): void {
  if (recalculated === null) {
    divergence.unknown++
    return
  }
  divergence.checked++
  if (stored !== recalculated) divergence.divergent++
}

export function analyze(
  dataset: ExportDataset,
  excluded: ReadonlySet<string>,
  pseudonymize: (uid: string) => string
): Analysis {
  const owners = researchDataOwners(dataset)
  const statusCounts = new Map<ParticipationStatus, number>()
  const included: ExportUser[] = []
  for (const user of dataset.users) {
    const status = classifyParticipation(user, excluded, owners.has(user.uid))
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
    if (status === 'incluido') included.push(user)
  }

  const ids = assignPseudonyms(
    included.map((user) => user.uid),
    pseudonymize
  )
  const participants: Participant[] = included.map((user) => {
    const progress = dataset.progress.filter((entry) => entry.uid === user.uid)
    const finalProgress = progress.find((entry) => entry.moduleId === FINAL_MODULE_ID)
    const trailCompletedAt = finalProgress?.completedAt ?? null
    return {
      id: ids.get(user.uid) ?? '',
      user,
      baselineGroup: classifyBaseline(user, trailCompletedAt),
      trailCompleted: trailCompletedAt !== null,
      progress,
      feedback: dataset.feedback.find((entry) => entry.uid === user.uid) ?? null,
    }
  })

  const quizDivergence: Divergence = { checked: 0, divergent: 0, unknown: 0 }
  const quizAttempts = numberAttempts(
    dataset.quizResults.filter((result) => ids.has(result.uid)),
    (result) => `${result.uid}|${result.moduleId}`
  ).map((result): QuizAttempt => {
    const answers = result.answers.map((answer) => {
      const correct = regradeQuizAnswer(result.moduleId, answer)
      tally(quizDivergence, answer.storedCorrect, correct)
      return { ...answer, correct }
    })
    const correct = answers.filter((answer) => answer.correct === true).length
    return {
      participantId: ids.get(result.uid) ?? '',
      moduleId: result.moduleId,
      attempt: result.attempt,
      completedAt: result.completedAt,
      timeSpentSeconds: result.timeSpentSeconds,
      answers,
      correct,
      total: answers.length,
      score: scoreOf(correct, answers.length),
    }
  })

  const decisionDivergence: Divergence = { checked: 0, divergent: 0, unknown: 0 }
  const simulationAttempts = numberAttempts(
    dataset.simulationResults.filter((result) => ids.has(result.uid)),
    (result) => `${result.uid}|${result.simulationId}`
  ).map((result): SimulationAttempt => {
    const decisions = result.decisions.map((decision, index) => {
      const correct = regradeDecision(result.simulationId, decision)
      tally(decisionDivergence, decision.storedCorrect, correct)
      return { ...decision, order: index + 1, correct }
    })
    return {
      participantId: ids.get(result.uid) ?? '',
      simulationId: result.simulationId,
      moduleId: result.moduleId,
      attempt: result.attempt,
      completedAt: result.completedAt,
      timeSpentSeconds: result.timeSpentSeconds,
      decisions,
      correct: decisions.filter((decision) => decision.correct === true).length,
    }
  })

  const loss = { exact: { expected: 0, missing: 0 }, approximate: { expected: 0, missing: 0 } }
  for (const participant of participants) {
    const bucket = participant.user.researchConsent?.version.startsWith('onboarding')
      ? loss.exact
      : loss.approximate
    for (const entry of participant.progress) {
      if (!entry.simulationCompleted) continue
      bucket.expected++
      const hasRecord = dataset.simulationResults.some(
        (result) => result.uid === participant.user.uid && result.moduleId === entry.moduleId
      )
      if (!hasRecord) bucket.missing++
    }
  }

  const comments = participants
    .map((participant) => participant.feedback?.comment ?? null)
    .filter((comment): comment is string => Boolean(comment))

  return {
    participants,
    statusCounts,
    quizAttempts,
    simulationAttempts,
    quizDivergence,
    decisionDivergence,
    loss,
    comments,
  }
}
