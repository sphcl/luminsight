// Só leitura: get() e nada mais. O teste readonly.test.ts falha se aparecer qualquer método de escrita aqui.
import type { Firestore } from 'firebase-admin/firestore'
import type { RiskPerception } from '../../src/types/user.types'
import type {
  ExportDataset,
  ExportFeedback,
  ExportProgress,
  ExportQuizResult,
  ExportSimulationResult,
  ExportUser,
} from './types'

type Data = Record<string, unknown>

function toDate(value: unknown): Date | null {
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate()
  }
  return null
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function asStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

export function toUser(uid: string, data: Data): ExportUser {
  const consent = data.researchConsent as Data | undefined
  const baseline = data.riskBaseline as Data | undefined
  return {
    uid,
    createdAt: toDate(data.createdAt),
    onboardingProfile: (data.onboardingProfile as ExportUser['onboardingProfile']) ?? null,
    researchConsent: consent
      ? {
          accepted: consent.accepted === true,
          isAdult: consent.isAdult === true,
          decidedAt: toDate(consent.decidedAt),
          version: asString(consent.version),
        }
      : null,
    riskBaseline: baseline
      ? {
          riskPerception: baseline.riskPerception as RiskPerception,
          collectedAfterUse: baseline.collectedAfterUse === true,
        }
      : null,
  }
}

export function toProgress(uid: string, moduleId: string, data: Data): ExportProgress {
  return {
    uid,
    moduleId,
    startedAt: toDate(data.startedAt),
    completedAt: toDate(data.completedAt),
    lessonsCompleted: asStrings(data.lessonsCompleted).length,
    quizBestScore: typeof data.quizBestScore === 'number' ? data.quizBestScore : null,
    quizAttempts: asNumber(data.quizAttempts),
    simulationCompleted: data.simulationCompleted === true,
  }
}

// Respostas antigas guardavam uma alternativa só, antes de existir questão de múltiplas respostas.
export function toQuizResult(data: Data): ExportQuizResult {
  const answers = Array.isArray(data.answers) ? (data.answers as Data[]) : []
  return {
    uid: asString(data.userId),
    moduleId: asString(data.moduleId),
    completedAt: toDate(data.completedAt),
    timeSpentSeconds: asNumber(data.timeSpentSeconds),
    answers: answers.map((answer) => ({
      questionId: asString(answer.questionId),
      selectedOptionIds: Array.isArray(answer.selectedOptionIds)
        ? asStrings(answer.selectedOptionIds)
        : asStrings([answer.selectedOptionId]),
      storedCorrect: answer.correct === true,
    })),
  }
}

export function toSimulationResult(data: Data): ExportSimulationResult {
  const decisions = Array.isArray(data.decisions) ? (data.decisions as Data[]) : []
  return {
    uid: asString(data.userId),
    simulationId: asString(data.simulationId),
    moduleId: asString(data.moduleId),
    completedAt: toDate(data.completedAt),
    timeSpentSeconds: asNumber(data.timeSpentSeconds),
    decisions: decisions.map((decision) => ({
      sceneId: asString(decision.sceneId),
      selectedOptionId: asString(decision.selectedOptionId),
      storedCorrect: decision.isCorrect === true,
    })),
  }
}

export function toFeedback(uid: string, data: Data): ExportFeedback {
  return {
    uid,
    securityKnowledge: data.securityKnowledge as ExportFeedback['securityKnowledge'],
    riskPerception: data.riskPerception as ExportFeedback['riskPerception'],
    satisfaction: data.satisfaction as ExportFeedback['satisfaction'],
    mostUseful: asStrings(data.mostUseful) as ExportFeedback['mostUseful'],
    comment: typeof data.comment === 'string' ? data.comment : null,
  }
}

export async function readDataset(db: Firestore): Promise<ExportDataset> {
  const [users, progress, quizResults, simulationResults, feedback] = await Promise.all([
    db.collection('users').get(),
    db.collectionGroup('progress').get(),
    db.collection('quizResults').get(),
    db.collection('simulationResults').get(),
    db.collection('trailFeedback').get(),
  ])

  return {
    users: users.docs.map((doc) => toUser(doc.id, doc.data())),
    // O caminho é users/{uid}/progress/{moduleId}: o uid sai do documento pai.
    progress: progress.docs.map((doc) =>
      toProgress(doc.ref.parent.parent?.id ?? '', doc.id, doc.data())
    ),
    quizResults: quizResults.docs.map((doc) => toQuizResult(doc.data())),
    simulationResults: simulationResults.docs.map((doc) => toSimulationResult(doc.data())),
    feedback: feedback.docs.map((doc) => toFeedback(doc.id, doc.data())),
  }
}
