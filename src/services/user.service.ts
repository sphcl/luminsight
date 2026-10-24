import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { onboardingProfileSchema } from '@/features/onboarding/schemas/onboarding.schema'
import { updateProfileSchema } from '@/features/profile/schemas/profile.schema'
import {
  consentChangeSchema,
  consentDecisionSchema,
} from '@/features/research/schemas/research.schema'
import type {
  ConsentVersion,
  OnboardingProfile,
  ResearchConsent,
  RiskBaseline,
  UserDocument,
} from '@/types/user.types'

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

interface ConsentFields {
  researchConsent: ResearchConsent
  riskBaseline?: RiskBaseline
}

// decidedAt sai do servidor, igual ao completedAt dos resultados.
function consentFields(
  decision: unknown,
  version: ConsentVersion,
  afterUse: boolean
): ConsentFields {
  const { accepted, isAdult, riskPerception } = consentDecisionSchema.parse(decision)
  const researchConsent: ResearchConsent = {
    accepted,
    isAdult,
    decidedAt: serverTimestamp(),
    version,
  }
  return riskPerception
    ? { researchConsent, riskBaseline: { riskPerception, collectedAfterUse: afterUse } }
    : { researchConsent }
}

export async function completeOnboarding(
  uid: string,
  answers: unknown,
  decision: unknown
): Promise<{ onboardingProfile: OnboardingProfile } & ConsentFields> {
  const onboardingProfile = onboardingProfileSchema.parse(answers)
  const fields = { onboardingProfile, ...consentFields(decision, 'onboarding-v1', false) }

  await updateDoc(doc(db, USERS_COLLECTION, uid), { onboardingCompleted: true, ...fields })

  return fields
}

// Conta criada antes do aviso: decide uma vez, e o "antes" fica marcado como coletado depois de usar.
export async function recordLateConsent(uid: string, decision: unknown): Promise<ConsentFields> {
  const fields = consentFields(decision, 'retroativo-v1', true)
  await updateDoc(doc(db, USERS_COLLECTION, uid), { ...fields })
  return fields
}

// Aceitar ou revogar pelo Perfil; o texto mostrado ali é o que cobre o que a pessoa já fez.
export async function changeResearchConsent(uid: string, input: unknown): Promise<ResearchConsent> {
  const { accepted, isAdult } = consentChangeSchema.parse(input)
  const researchConsent: ResearchConsent = {
    accepted,
    isAdult,
    decidedAt: serverTimestamp(),
    version: 'retroativo-v1',
  }

  await updateDoc(doc(db, USERS_COLLECTION, uid), { researchConsent })
  return researchConsent
}

export async function updateDisplayName(uid: string, input: unknown): Promise<string> {
  const { displayName } = updateProfileSchema.parse(input)

  // Monto o objeto na mão em vez de repassar o input, assim nada além do nome chega no documento.
  await updateDoc(doc(db, USERS_COLLECTION, uid), { displayName })

  return displayName
}
