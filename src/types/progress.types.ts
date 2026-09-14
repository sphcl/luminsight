import type { Timestamp, FieldValue } from 'firebase/firestore'

// Documento da subcoleção "users/{uid}/progress/{moduleId}": o path já
// amarra o progresso ao usuário e ao módulo, então nenhum dos dois vira
// campo aqui. O id do documento é o próprio moduleId, então getModuleProgress
// é um doc() direto, sem precisar de query.
export interface ProgressDocument {
  startedAt: Timestamp | FieldValue
  completedAt: Timestamp | FieldValue | null
  lessonsCompleted: string[]
  quizBestScore: number | null
  quizAttempts: number
  simulationCompleted: boolean
  lastUpdatedAt: Timestamp | FieldValue
}

// Progresso indexado por moduleId, como os hooks/serviços expõem para a UI.
export type ProgressMap = Record<string, ProgressDocument>

export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed'
