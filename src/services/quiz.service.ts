import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { QuizResultDocument } from '@/types/quiz.types'

const QUIZ_RESULTS_COLLECTION = 'quizResults'

// Resultado de quiz é imutável depois de criado (ver firestore.rules: só
// "create" é permitido, "update"/"delete" são sempre false), então esse
// serviço só cria resultado, não expõe leitura nem edição.
// completedAt sai do servidor pra ninguém gravar uma tentativa com data inventada.
export async function saveQuizResult(
  result: Omit<QuizResultDocument, 'completedAt'>
): Promise<void> {
  const document: QuizResultDocument = { ...result, completedAt: serverTimestamp() }
  await addDoc(collection(db, QUIZ_RESULTS_COLLECTION), document)
}
