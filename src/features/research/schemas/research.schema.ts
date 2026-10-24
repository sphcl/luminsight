import { z } from 'zod'
import type { Satisfaction, UsefulPart } from '@/types/research.types'
import type { RiskPerception } from '@/types/user.types'
import { SECURITY_KNOWLEDGE_OPTIONS } from '@/features/onboarding/schemas/onboarding.schema'

interface Option<T extends string> {
  value: T
  label: string
}

export const RISK_PERCEPTION_QUESTION =
  'Na sua opinião, qual a chance de você cair em um golpe digital?'

// Escala de 4 sem meio, de propósito: o motivo está em docs/modelagem.md. Mesmos valores das rules.
export const RISK_PERCEPTION_OPTIONS: Option<RiskPerception>[] = [
  { value: 'muito_baixa', label: 'Muito baixa' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'alta', label: 'Alta' },
  { value: 'muito_alta', label: 'Muito alta' },
]

export const SATISFACTION_OPTIONS: Option<Satisfaction>[] = [
  { value: 'gostei_muito', label: 'Gostei muito' },
  { value: 'gostei', label: 'Gostei' },
  { value: 'indiferente', label: 'Indiferente' },
  { value: 'nao_gostei', label: 'Não gostei' },
  { value: 'nao_gostei_nada', label: 'Não gostei nada' },
]

export const USEFUL_PART_OPTIONS: Option<UsefulPart>[] = [
  { value: 'licoes', label: 'Lições' },
  { value: 'quizzes', label: 'Quizzes' },
  { value: 'simulacoes', label: 'Simulações' },
  { value: 'nada', label: 'Nada em especial' },
]

export const COMMENT_MAX_LENGTH = 500

function enumOf<T extends string>(options: Option<T>[]) {
  return z.enum(options.map((option) => option.value) as [T, ...T[]])
}

export const riskPerceptionSchema = enumOf(RISK_PERCEPTION_OPTIONS)

// Strict porque o objeto vai direto pro documento; comentário vazio vira ausência, não string vazia.
export const trailFeedbackSchema = z
  .object({
    securityKnowledge: enumOf(SECURITY_KNOWLEDGE_OPTIONS),
    riskPerception: riskPerceptionSchema,
    satisfaction: enumOf(SATISFACTION_OPTIONS),
    mostUseful: z
      .array(enumOf(USEFUL_PART_OPTIONS))
      .min(1)
      .refine((parts) => new Set(parts).size === parts.length, 'Opção repetida.')
      .refine(
        (parts) => !parts.includes('nada') || parts.length === 1,
        '"Nada em especial" é sozinha.'
      ),
    comment: z
      .string()
      .trim()
      .max(COMMENT_MAX_LENGTH, `O comentário pode ter até ${COMMENT_MAX_LENGTH} caracteres.`)
      .optional()
      .transform((comment) => (comment ? comment : undefined)),
  })
  .strict()

export type TrailFeedbackInput = z.infer<typeof trailFeedbackSchema>

const consentBase = {
  accepted: z.boolean(),
  isAdult: z.boolean(),
}

// Percepção de risco só existe pra quem aceitou: as rules recusam qualquer outra combinação.
export const consentDecisionSchema = z
  .object({ ...consentBase, riskPerception: riskPerceptionSchema.optional() })
  .strict()
  .refine((decision) => !decision.accepted || decision.isAdult, 'Aceite exige 18 anos ou mais.')
  .refine(
    (decision) => decision.accepted === (decision.riskPerception !== undefined),
    'Percepção de risco só acompanha o aceite.'
  )

export const consentChangeSchema = z
  .object(consentBase)
  .strict()
  .refine((decision) => !decision.accepted || decision.isAdult, 'Aceite exige 18 anos ou mais.')

export type ConsentDecision = z.infer<typeof consentDecisionSchema>
