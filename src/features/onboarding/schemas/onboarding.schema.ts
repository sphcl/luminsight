import { z } from 'zod'
import type {
  LearningGoal,
  OnboardingProfile,
  ScamExperience,
  SecurityKnowledge,
} from '@/types/user.types'

interface OnboardingOption<T extends string> {
  value: T
  label: string
}

export const SECURITY_KNOWLEDGE_OPTIONS: OnboardingOption<SecurityKnowledge>[] = [
  { value: 'nenhum', label: 'Nunca parei pra pensar nisso' },
  { value: 'basico', label: 'Sei o básico, tipo não passar senha pra ninguém' },
  { value: 'intermediario', label: 'Me cuido bem e reconheço golpes comuns' },
  { value: 'avancado', label: 'Entendo bastante e costumo ajudar outras pessoas' },
]

export const SCAM_EXPERIENCE_OPTIONS: OnboardingOption<ScamExperience>[] = [
  { value: 'sim', label: 'Sim, já caí' },
  { value: 'quase', label: 'Quase caí, mas percebi a tempo' },
  { value: 'nao', label: 'Não' },
  { value: 'nao_sei', label: 'Não sei dizer' },
]

export const LEARNING_GOAL_OPTIONS: OnboardingOption<LearningGoal>[] = [
  { value: 'golpes_whatsapp', label: 'Golpes por WhatsApp e redes sociais' },
  { value: 'phishing', label: 'Reconhecer emails e links falsos' },
  { value: 'senhas', label: 'Criar e guardar senhas seguras' },
  { value: 'compras_online', label: 'Comprar e pagar com segurança na internet' },
  { value: 'proteger_familia', label: 'Proteger minha família' },
]

function enumOf<T extends string>(options: OnboardingOption<T>[]) {
  return z.enum(options.map((option) => option.value) as [T, ...T[]])
}

// Uso strict pra barrar campo extra: o objeto vai direto pro documento do usuário.
export const onboardingProfileSchema = z
  .object({
    securityKnowledge: enumOf(SECURITY_KNOWLEDGE_OPTIONS),
    scamExperience: enumOf(SCAM_EXPERIENCE_OPTIONS),
    learningGoals: z
      .array(enumOf(LEARNING_GOAL_OPTIONS))
      .min(1, 'Escolha pelo menos um tema.')
      .max(LEARNING_GOAL_OPTIONS.length)
      .refine((goals) => new Set(goals).size === goals.length, 'Tema repetido.'),
  })
  .strict() satisfies z.ZodType<OnboardingProfile>
