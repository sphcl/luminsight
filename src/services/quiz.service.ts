import { addDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { QuizResultDocument } from '@/types/quiz.types'

const QUIZ_RESULTS_COLLECTION = 'quizResults'

// Resultado de quiz é imutável depois de criado (ver firestore.rules: só
// "create" é permitido, "update"/"delete" são sempre false), então esse
// serviço não expõe get-by-id nem edição, só criar e listar histórico.
export async function saveQuizResult(result: QuizResultDocument): Promise<void> {
  await addDoc(collection(db, QUIZ_RESULTS_COLLECTION), result)
}

export async function getUserQuizResults(
  uid: string,
  moduleId?: string
): Promise<QuizResultDocument[]> {
  const constraints = moduleId
    ? [where('userId', '==', uid), where('moduleId', '==', moduleId)]
    : [where('userId', '==', uid)]

  const resultsQuery = query(
    collection(db, QUIZ_RESULTS_COLLECTION),
    ...constraints,
    orderBy('completedAt', 'desc')
  )

  const snapshot = await getDocs(resultsQuery)
  return snapshot.docs.map((docSnapshot) => docSnapshot.data() as QuizResultDocument)
}
