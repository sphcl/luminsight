import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type FieldValue,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { trailFeedbackSchema } from '@/features/research/schemas/research.schema'
import type { SimulationResultDocument, TrailFeedbackDocument } from '@/types/research.types'

const SIMULATION_RESULTS_COLLECTION = 'simulationResults'
const TRAIL_FEEDBACK_COLLECTION = 'trailFeedback'

// Mesmo padrão de saveQuizResult: só cria, e a data vem do servidor.
export async function saveSimulationResult(
  result: Omit<SimulationResultDocument, 'completedAt'>
): Promise<void> {
  const document: SimulationResultDocument = { ...result, completedAt: serverTimestamp() }
  await addDoc(collection(db, SIMULATION_RESULTS_COLLECTION), document)
}

export async function hasTrailFeedback(uid: string): Promise<boolean> {
  const snapshot = await getDoc(doc(db, TRAIL_FEEDBACK_COLLECTION, uid))
  return snapshot.exists()
}

export async function saveTrailFeedback(uid: string, input: unknown): Promise<void> {
  const { comment, ...answers } = trailFeedbackSchema.parse(input)
  // Sem comentário o campo nem existe: as rules não aceitam string vazia.
  const document: TrailFeedbackDocument = {
    userId: uid,
    submittedAt: serverTimestamp(),
    ...answers,
    ...(comment ? { comment } : {}),
  }
  await setDoc(doc(db, TRAIL_FEEDBACK_COLLECTION, uid), document)
}

export async function dismissTrailFeedback(uid: string): Promise<FieldValue> {
  const trailFeedbackDismissedAt = serverTimestamp()
  await updateDoc(doc(db, 'users', uid), { trailFeedbackDismissedAt })
  return trailFeedbackDismissedAt
}
