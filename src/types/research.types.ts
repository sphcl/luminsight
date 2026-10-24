import type { Timestamp, FieldValue } from 'firebase/firestore'
import type { RiskPerception, SecurityKnowledge } from './user.types'

export interface SimulationDecisionEntry {
  sceneId: string
  selectedOptionId: string
  isCorrect: boolean
}

// Documento da coleção "simulationResults": uma tentativa por documento, como em quizResults.
export interface SimulationResultDocument {
  userId: string
  simulationId: string
  moduleId: string
  completedAt: Timestamp | FieldValue
  totalDecisions: number
  correctDecisions: number
  timeSpentSeconds: number
  decisions: SimulationDecisionEntry[]
}

export type Satisfaction =
  'gostei_muito' | 'gostei' | 'indiferente' | 'nao_gostei' | 'nao_gostei_nada'

export type UsefulPart = 'licoes' | 'quizzes' | 'simulacoes' | 'nada'

// Documento "trailFeedback/{uid}": pós-teste e satisfação, uma resposta por pessoa.
export interface TrailFeedbackDocument {
  userId: string
  submittedAt: Timestamp | FieldValue
  securityKnowledge: SecurityKnowledge
  riskPerception: RiskPerception
  satisfaction: Satisfaction
  mostUseful: UsefulPart[]
  comment?: string
}
