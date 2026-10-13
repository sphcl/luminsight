import type { Timestamp, FieldValue } from 'firebase/firestore'

// Documento do usuário no Firestore (coleção "users")
// createdAt e lastLoginAt chegam como FieldValue no momento da escrita (serverTimestamp())
// e voltam como Timestamp na leitura, por isso o union nos dois campos.
export interface UserDocument {
  displayName: string
  email: string
  photoURL: string | null
  createdAt: Timestamp | FieldValue
  lastLoginAt: Timestamp | FieldValue
  onboardingCompleted: boolean
  completedModules: string[]
  completedLessons: string[]
  completedSimulations: string[]
  totalQuizzesCompleted: number
  role: 'user'
  // Opcional porque contas criadas antes do onboarding existir não têm esse campo.
  onboardingProfile?: OnboardingProfile
}

export type SecurityKnowledge = 'iniciante' | 'intermediario' | 'avancado'
export type ScamExperience = 'sim' | 'nao' | 'prefiro_nao_responder'
export type OnboardingMotivation =
  'aprender_basico' | 'proteger_familia' | 'interesse_profissional' | 'curiosidade'

export interface OnboardingProfile {
  securityKnowledge: SecurityKnowledge
  scamExperience: ScamExperience
  motivation: OnboardingMotivation
}

// Recorte do usuário autenticado que nos interessa, direto do Firebase Auth
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
}
