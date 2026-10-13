import { z } from 'zod'
import type {
  OnboardingMotivation,
  OnboardingProfile,
  ScamExperience,
  SecurityKnowledge,
} from '@/types/user.types'

interface OnboardingOption<T extends string> {
  value: T
  label: string
}

// Se mudar algum valor aqui, tenho que mudar junto em isValidOnboardingProfile no firestore.rules.
export const SECURITY_KNOWLEDGE_OPTIONS: OnboardingOption<SecurityKnowledge>[] = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
]

export const SCAM_EXPERIENCE_OPTIONS: OnboardingOption<ScamExperience>[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'prefiro_nao_responder', label: 'Prefiro não responder' },
]

export const MOTIVATION_OPTIONS: OnboardingOption<OnboardingMotivation>[] = [
  { value: 'aprender_basico', label: 'Aprender o básico' },
  { value: 'proteger_familia', label: 'Proteger a família' },
  { value: 'interesse_profissional', label: 'Interesse profissional' },
  { value: 'curiosidade', label: 'Curiosidade' },
]

function enumOf<T extends string>(options: OnboardingOption<T>[]) {
  return z.enum(options.map((option) => option.value) as [T, ...T[]])
}

// Uso strict pra barrar campo extra: o objeto vai direto pro documento do usuário.
export const onboardingProfileSchema = z
  .object({
    securityKnowledge: enumOf(SECURITY_KNOWLEDGE_OPTIONS),
    scamExperience: enumOf(SCAM_EXPERIENCE_OPTIONS),
    motivation: enumOf(MOTIVATION_OPTIONS),
  })
  .strict() satisfies z.ZodType<OnboardingProfile>
