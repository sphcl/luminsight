import type {
  ConsentVersion,
  OnboardingProfile,
  RiskPerception,
  SecurityKnowledge,
} from '../../src/types/user.types'
import type { Satisfaction, UsefulPart } from '../../src/types/research.types'

// Tudo que vem do banco é convertido pra estes tipos na leitura, com datas como Date e nada de Timestamp.
export interface ExportUser {
  uid: string
  createdAt: Date | null
  onboardingProfile: OnboardingProfile | null
  researchConsent: {
    accepted: boolean
    isAdult: boolean
    decidedAt: Date | null
    version: ConsentVersion | string
  } | null
  riskBaseline: { riskPerception: RiskPerception; collectedAfterUse: boolean } | null
}

export interface ExportProgress {
  uid: string
  moduleId: string
  startedAt: Date | null
  completedAt: Date | null
  lessonsCompleted: number
  quizBestScore: number | null
  quizAttempts: number
  simulationCompleted: boolean
}

export interface ExportQuizAnswer {
  questionId: string
  selectedOptionIds: string[]
  storedCorrect: boolean
}

export interface ExportQuizResult {
  uid: string
  moduleId: string
  completedAt: Date | null
  timeSpentSeconds: number
  answers: ExportQuizAnswer[]
}

export interface ExportDecision {
  sceneId: string
  selectedOptionId: string
  storedCorrect: boolean
}

export interface ExportSimulationResult {
  uid: string
  simulationId: string
  moduleId: string
  completedAt: Date | null
  timeSpentSeconds: number
  decisions: ExportDecision[]
}

export interface ExportFeedback {
  uid: string
  securityKnowledge: SecurityKnowledge
  riskPerception: RiskPerception
  satisfaction: Satisfaction
  mostUseful: UsefulPart[]
  comment: string | null
}

export interface ExportDataset {
  users: ExportUser[]
  progress: ExportProgress[]
  quizResults: ExportQuizResult[]
  simulationResults: ExportSimulationResult[]
  feedback: ExportFeedback[]
}
