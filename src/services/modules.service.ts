import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { parseLesson, parseModule } from '@/utils/security/firestore-validators'
import type { LessonWithId, ModuleWithId } from '@/types/module.types'

const MODULES_COLLECTION = 'modules'
const LESSONS_SUBCOLLECTION = 'lessons'

function lessonsCollection(moduleId: string) {
  return collection(db, MODULES_COLLECTION, moduleId, LESSONS_SUBCOLLECTION)
}

// Lista só os módulos ativos (isActive: true). Um módulo em rascunho no
// Firestore não deve aparecer na trilha antes de estar pronto para publicar.
export async function getModules(): Promise<ModuleWithId[]> {
  const modulesQuery = query(
    collection(db, MODULES_COLLECTION),
    where('isActive', '==', true),
    orderBy('order')
  )
  const snapshot = await getDocs(modulesQuery)

  // Um doc que falha na validação é ignorado em vez de derrubar a lista
  // inteira: melhor faltar um módulo na trilha do que a tela inteira quebrar.
  return snapshot.docs.flatMap((docSnapshot) => {
    const parsed = parseModule(docSnapshot.data())
    return parsed ? [{ id: docSnapshot.id, ...parsed }] : []
  })
}

export async function getModuleById(moduleId: string): Promise<ModuleWithId | null> {
  const snapshot = await getDoc(doc(db, MODULES_COLLECTION, moduleId))
  if (!snapshot.exists()) return null

  const parsed = parseModule(snapshot.data())
  return parsed ? { id: snapshot.id, ...parsed } : null
}

export async function getLessons(moduleId: string): Promise<LessonWithId[]> {
  const lessonsQuery = query(lessonsCollection(moduleId), orderBy('order'))
  const snapshot = await getDocs(lessonsQuery)

  return snapshot.docs.flatMap((docSnapshot) => {
    const parsed = parseLesson(docSnapshot.data())
    return parsed ? [{ id: docSnapshot.id, ...parsed }] : []
  })
}

export async function getLessonById(
  moduleId: string,
  lessonId: string
): Promise<LessonWithId | null> {
  const snapshot = await getDoc(doc(lessonsCollection(moduleId), lessonId))
  if (!snapshot.exists()) return null

  const parsed = parseLesson(snapshot.data())
  return parsed ? { id: snapshot.id, ...parsed } : null
}
