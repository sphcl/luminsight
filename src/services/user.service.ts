import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserDocument } from '@/types/user.types'

const USERS_COLLECTION = 'users'

interface UserProfileInput {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

export async function getUserDocument(uid: string): Promise<UserDocument | null> {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid))
  return snapshot.exists() ? (snapshot.data() as UserDocument) : null
}

export async function createUserDocument({
  uid,
  displayName,
  email,
  photoURL,
}: UserProfileInput): Promise<UserDocument> {
  const newDocument: UserDocument = {
    displayName: displayName ?? 'Usuário',
    email: email ?? '',
    photoURL,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
    onboardingCompleted: false,
    completedModules: [],
    completedLessons: [],
    completedSimulations: [],
    totalQuizzesCompleted: 0,
    role: 'user',
  }

  await setDoc(doc(db, USERS_COLLECTION, uid), newDocument)
  return newDocument
}

// Login com Google não distingue primeiro acesso de acesso recorrente, então
// a gente decide isso na mão: se já existe documento, só atualiza lastLoginAt;
// se não existe, cria do zero
export async function ensureUserDocument(input: UserProfileInput): Promise<UserDocument> {
  const existingDocument = await getUserDocument(input.uid)

  if (existingDocument) {
    await updateDoc(doc(db, USERS_COLLECTION, input.uid), {
      lastLoginAt: serverTimestamp(),
    })
    return existingDocument
  }

  return createUserDocument(input)
}
