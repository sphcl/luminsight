import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ZodError } from 'zod'
import { Button, Card, ProgressBar } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import {
  MOTIVATION_OPTIONS,
  SCAM_EXPERIENCE_OPTIONS,
  SECURITY_KNOWLEDGE_OPTIONS,
} from '@/features/onboarding/schemas/onboarding.schema'
import { completeOnboarding } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { mapFirestoreError } from '@/utils/security/errors'
import { cn } from '@/utils/helpers/classnames'
import type { OnboardingProfile } from '@/types/user.types'

type Answers = { [K in keyof OnboardingProfile]: OnboardingProfile[K] | null }

interface Step<K extends keyof OnboardingProfile> {
  field: K
  question: string
  options: { value: OnboardingProfile[K]; label: string }[]
}

type AnyStep = { [K in keyof OnboardingProfile]: Step<K> }[keyof OnboardingProfile]

const STEPS: [AnyStep, ...AnyStep[]] = [
  {
    field: 'securityKnowledge',
    question: 'Qual seu nível de conhecimento sobre segurança digital?',
    options: SECURITY_KNOWLEDGE_OPTIONS,
  },
  {
    field: 'scamExperience',
    question: 'Você ou alguém próximo já caiu em um golpe digital?',
    options: SCAM_EXPERIENCE_OPTIONS,
  },
  {
    field: 'motivation',
    question: 'O que te trouxe aqui?',
    options: MOTIVATION_OPTIONS,
  },
]

const EMPTY_ANSWERS: Answers = { securityKnowledge: null, scamExperience: null, motivation: null }

const optionClass =
  'flex cursor-pointer items-center gap-3 rounded-lg border border-surface-border bg-white p-3 text-sm text-slate-700 transition-colors hover:bg-surface-muted has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500'

export function Onboarding() {
  const { user, userDocument } = useAuth()
  const setUserDocument = useAuthStore((state) => state.setUserDocument)
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // eslint-disable-next-line security/detect-object-injection -- índice numérico controlado pelo componente
  const step = STEPS[stepIndex] ?? STEPS[0]
  const isLastStep = stepIndex === STEPS.length - 1
  const currentAnswer = answers[step.field]
  const allAnswered = Object.values(answers).every((answer) => answer !== null)
  const canAdvance = isLastStep ? allAnswered : currentAnswer !== null

  async function handleFinish() {
    if (!user || !allAnswered) return

    setIsSaving(true)
    setError(null)
    try {
      const profile = await completeOnboarding(user.uid, answers)

      if (userDocument) {
        setUserDocument({ ...userDocument, onboardingCompleted: true, onboardingProfile: profile })
      }
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (caughtError) {
      if (caughtError instanceof ZodError) {
        setError('Revise suas respostas e tente de novo.')
      } else {
        mapFirestoreError(caughtError)
        setError('Não foi possível salvar suas respostas. Tente novamente.')
      }
      setIsSaving(false)
    }
  }

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-slate-900">Vamos te conhecer</h1>
        <p className="text-sm text-slate-600">
          Três perguntas rápidas pra gente entender seu ponto de partida.
        </p>
        <ProgressBar
          value={stepIndex + 1}
          max={STEPS.length}
          label={`Passo ${stepIndex + 1} de ${STEPS.length}`}
        />
      </div>

      <fieldset key={step.field} className="flex flex-col gap-2">
        <legend className="mb-3 font-semibold text-slate-900">{step.question}</legend>
        {step.options.map((option) => (
          <label key={option.value} className={optionClass}>
            <input
              type="radio"
              name={step.field}
              value={option.value}
              checked={currentAnswer === option.value}
              onChange={() => setAnswers((current) => ({ ...current, [step.field]: option.value }))}
              className="accent-primary-600"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-danger-700">
          {error}
        </p>
      )}

      <div className={cn('flex gap-3', stepIndex > 0 ? 'justify-between' : 'justify-end')}>
        {stepIndex > 0 && (
          <Button
            variant="secondary"
            onClick={() => setStepIndex(stepIndex - 1)}
            disabled={isSaving}
          >
            Voltar
          </Button>
        )}
        {isLastStep ? (
          <Button onClick={() => void handleFinish()} disabled={!canAdvance} isLoading={isSaving}>
            Concluir
          </Button>
        ) : (
          <Button onClick={() => setStepIndex(stepIndex + 1)} disabled={!canAdvance}>
            Continuar
          </Button>
        )}
      </div>
    </Card>
  )
}
