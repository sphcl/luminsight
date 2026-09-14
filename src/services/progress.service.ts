import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { parseProgress } from '@/utils/security/firestore-validators'
import type { ProgressDocument, ProgressMap } from '@/types/progress.types'

const USERS_COLLECTION = 'users'
const PROGRESS_SUBCOLLECTION = 'progress'

function progressCollection(uid: string) {
  return collection(db, USERS_COLLECTION, uid, PROGRESS_SUBCOLLECTION)
}

function progressDocRef(uid: string, moduleId: string) {
  return doc(progressCollection(uid), moduleId)
}

export async function getUserProgress(uid: string): Promise<ProgressMap> {
  const snapshot = await getDocs(progressCollection(uid))

  const entries = snapshot.docs.flatMap((docSnapshot) => {
    const parsed = parseProgress(docSnapshot.data())
    return parsed ? [[docSnapshot.id, parsed] as const] : []
  })

  return Object.fromEntries(entries)
}

export async function getModuleProgress(
  uid: string,
  moduleId: string
): Promise<ProgressDocument | null> {
  const snapshot = await getDoc(progressDocRef(uid, moduleId))
  if (!snapshot.exists()) return null

  return parseProgress(snapshot.data())
}

// markLessonCompleted e saveQuizAttempt rodam em transação porque a
// operação não é um write isolado: primeiro precisamos saber se o documento
// de progresso já existe (para decidir entre criar com os defaults ou só
// atualizar), e essa checagem + escrita tem que ser atômica. Um simples
// getDoc() seguido de setDoc() fora de transação teria uma janela de corrida:
// se duas chamadas concluírem lições diferentes quase ao mesmo tempo, as duas
// podem ler "documento não existe" e uma sobrescreveria a criação da outra.
// runTransaction() detecta esse conflito e tenta de novo automaticamente.
// Dentro da transação, ainda usamos arrayUnion()/increment() em vez de mexer
// no array/número na mão, são mutações resolvidas pelo servidor, então nunca
// duplicam uma lição nem perdem uma tentativa de quiz por causa de uma leitura
// desatualizada.
export async function markLessonCompleted(
  uid: string,
  moduleId: string,
  lessonId: string
): Promise<void> {
  const ref = progressDocRef(uid, moduleId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      transaction.set(ref, {
        startedAt: serverTimestamp(),
        completedAt: null,
        lessonsCompleted: [lessonId],
        quizBestScore: null,
        quizAttempts: 0,
        simulationCompleted: false,
        lastUpdatedAt: serverTimestamp(),
      })
      return
    }

    transaction.update(ref, {
      lessonsCompleted: arrayUnion(lessonId),
      lastUpdatedAt: serverTimestamp(),
    })
  })
}

export async function markSimulationCompleted(uid: string, moduleId: string): Promise<void> {
  const ref = progressDocRef(uid, moduleId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      transaction.set(ref, {
        startedAt: serverTimestamp(),
        completedAt: null,
        lessonsCompleted: [],
        quizBestScore: null,
        quizAttempts: 0,
        simulationCompleted: true,
        lastUpdatedAt: serverTimestamp(),
      })
      return
    }

    transaction.update(ref, {
      simulationCompleted: true,
      lastUpdatedAt: serverTimestamp(),
    })
  })
}

export async function saveQuizAttempt(
  uid: string,
  moduleId: string,
  score: number
): Promise<void> {
  const ref = progressDocRef(uid, moduleId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      transaction.set(ref, {
        startedAt: serverTimestamp(),
        completedAt: null,
        lessonsCompleted: [],
        quizBestScore: score,
        quizAttempts: 1,
        simulationCompleted: false,
        lastUpdatedAt: serverTimestamp(),
      })
      return
    }

    // "Só atualiza se for maior" depende do valor atual, então isso não dá
    // pra resolver com um increment/merge cego. Por isso o read acontece
    // dentro da própria transação, que garante que ninguém mais escreveu
    // nesse documento entre o get() e o update().
    const current = parseProgress(snapshot.data())
    const currentBest = current?.quizBestScore ?? null
    const nextBest = currentBest === null ? score : Math.max(currentBest, score)

    transaction.update(ref, {
      quizBestScore: nextBest,
      quizAttempts: increment(1),
      lastUpdatedAt: serverTimestamp(),
    })
  })
}

export async function markModuleCompleted(uid: string, moduleId: string): Promise<void> {
  const ref = progressDocRef(uid, moduleId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      transaction.set(ref, {
        startedAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        lessonsCompleted: [],
        quizBestScore: null,
        quizAttempts: 0,
        simulationCompleted: false,
        lastUpdatedAt: serverTimestamp(),
      })
      return
    }

    transaction.update(ref, {
      completedAt: serverTimestamp(),
      lastUpdatedAt: serverTimestamp(),
    })
  })
}
