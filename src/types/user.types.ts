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
  // Ausente só em conta criada antes do aviso de pesquisa; a ausência é o que dispara o aviso único.
  researchConsent?: ResearchConsent
  riskBaseline?: RiskBaseline
  trailFeedbackDismissedAt?: Timestamp | FieldValue
}

export type ConsentVersion = 'onboarding-v1' | 'retroativo-v1'

// Idade nunca é gravada: isAdult é só a declaração de ter 18 anos ou mais.
export interface ResearchConsent {
  accepted: boolean
  isAdult: boolean
  decidedAt: Timestamp | FieldValue
  version: ConsentVersion
}

export type RiskPerception = 'muito_baixa' | 'baixa' | 'alta' | 'muito_alta'

// collectedAfterUse separa o "antes" de verdade do que só foi perguntado depois de a pessoa já usar o site.
export interface RiskBaseline {
  riskPerception: RiskPerception
  collectedAfterUse: boolean
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
