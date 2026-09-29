import { useState } from 'react'
import { ZodError } from 'zod'
import { Button, Card, ProgressBar } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import {
  LEARNING_GOAL_OPTIONS,
  SCAM_EXPERIENCE_OPTIONS,
  SECURITY_KNOWLEDGE_OPTIONS,
} from '@/features/onboarding/schemas/onboarding.schema'
import { completeOnboarding } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { mapFirestoreError } from '@/utils/security/errors'
import { cn } from '@/utils/helpers/classnames'
import type { LearningGoal, ScamExperience, SecurityKnowledge } from '@/types/user.types'

const TOTAL_STEPS = 3

const optionClass =
  'flex cursor-pointer items-center gap-3 rounded-lg border border-surface-border bg-white p-3 text-sm text-slate-700 transition-colors hover:bg-surface-muted has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500'

export function Onboarding() {
  const { user, userDocument } = useAuth()
  const setUserDocument = useAuthStore((state) => state.setUserDocument)
  const [step, setStep] = useState(0)
  const [securityKnowledge, setSecurityKnowledge] = useState<SecurityKnowledge | null>(null)
  const [scamExperience, setScamExperience] = useState<ScamExperience | null>(null)
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isStepAnswered = [
    securityKnowledge !== null,
    scamExperience !== null,
    learningGoals.length > 0,
  ]
  // eslint-disable-next-line security/detect-object-injection -- step é índice numérico controlado
  const canAdvance = isStepAnswered[step] ?? false
  const isLastStep = step === TOTAL_STEPS - 1

  function toggleGoal(goal: LearningGoal) {
    setLearningGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]
    )
  }

  async function handleFinish() {
    if (!user) return

    setIsSaving(true)
    setError(null)
    try {
      const profile = await completeOnboarding(user.uid, {
        securityKnowledge,
        scamExperience,
        learningGoals,
      })

      if (userDocument) {
        setUserDocument({ ...userDocument, onboardingCompleted: true, onboardingProfile: profile })
      }
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
          value={step + 1}
          max={TOTAL_STEPS}
          label={`Passo ${step + 1} de ${TOTAL_STEPS}`}
        />
      </div>

      {step === 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-3 font-semibold text-slate-900">
            Quanto você entende de segurança digital?
          </legend>
          {SECURITY_KNOWLEDGE_OPTIONS.map((option) => (
            <label key={option.value} className={optionClass}>
              <input
                type="radio"
                name="securityKnowledge"
                value={option.value}
                checked={securityKnowledge === option.value}
                onChange={() => setSecurityKnowledge(option.value)}
                className="accent-primary-600"
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-3 font-semibold text-slate-900">
            Você já caiu em algum golpe pela internet ou pelo celular?
          </legend>
          {SCAM_EXPERIENCE_OPTIONS.map((option) => (
            <label key={option.value} className={optionClass}>
              <input
                type="radio"
                name="scamExperience"
                value={option.value}
                checked={scamExperience === option.value}
                onChange={() => setScamExperience(option.value)}
                className="accent-primary-600"
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 font-semibold text-slate-900">O que você quer aprender?</legend>
          <p className="mb-2 text-sm text-slate-500">Pode escolher mais de um.</p>
          {LEARNING_GOAL_OPTIONS.map((option) => (
            <label key={option.value} className={optionClass}>
              <input
                type="checkbox"
                name="learningGoals"
                value={option.value}
                checked={learningGoals.includes(option.value)}
                onChange={() => toggleGoal(option.value)}
                className="accent-primary-600"
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger-700">
          {error}
        </p>
      )}

      <div className={cn('flex gap-3', step > 0 ? 'justify-between' : 'justify-end')}>
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={isSaving}>
            Voltar
          </Button>
        )}
        {isLastStep ? (
          <Button onClick={() => void handleFinish()} disabled={!canAdvance} isLoading={isSaving}>
            Concluir
          </Button>
        ) : (
          <Button onClick={() => setStep(step + 1)} disabled={!canAdvance}>
            Continuar
          </Button>
        )}
      </div>
    </Card>
  )
}
