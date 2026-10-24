import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, ProgressBar } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { CONSENT_TEXTS } from '@/content/research'
import { useAuth } from '@/hooks/useAuth'
import {
  MOTIVATION_OPTIONS,
  SCAM_EXPERIENCE_OPTIONS,
  SECURITY_KNOWLEDGE_OPTIONS,
} from '@/features/onboarding/schemas/onboarding.schema'
import { ChoiceQuestion } from '@/features/research/components/ChoiceQuestion'
import { reportResearchFailure } from '@/features/research/reportResearchFailure'
import { ConsentForm, type ConsentChoice } from '@/features/research/components/ConsentForm'
import {
  RISK_PERCEPTION_OPTIONS,
  RISK_PERCEPTION_QUESTION,
} from '@/features/research/schemas/research.schema'
import { completeOnboarding } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/utils/helpers/classnames'
import type { OnboardingProfile, RiskPerception } from '@/types/user.types'

interface Answers {
  securityKnowledge: OnboardingProfile['securityKnowledge'] | null
  riskPerception: RiskPerception | null
  scamExperience: OnboardingProfile['scamExperience'] | null
  motivation: OnboardingProfile['motivation'] | null
}

type QuestionField = keyof Answers

interface Question<K extends QuestionField> {
  field: K
  question: string
  options: { value: NonNullable<Answers[K]>; label: string }[]
}

type AnyQuestion = { [K in QuestionField]: Question<K> }[QuestionField]

const KNOWLEDGE: AnyQuestion = {
  field: 'securityKnowledge',
  question: 'Qual seu nível de conhecimento sobre segurança digital?',
  options: SECURITY_KNOWLEDGE_OPTIONS,
}
const RISK: AnyQuestion = {
  field: 'riskPerception',
  question: RISK_PERCEPTION_QUESTION,
  options: RISK_PERCEPTION_OPTIONS,
}
const SCAM: AnyQuestion = {
  field: 'scamExperience',
  question: 'Você ou alguém próximo já caiu em um golpe digital?',
  options: SCAM_EXPERIENCE_OPTIONS,
}
const MOTIVATION: AnyQuestion = {
  field: 'motivation',
  question: 'O que te trouxe aqui?',
  options: MOTIVATION_OPTIONS,
}

const EMPTY_ANSWERS: Answers = {
  securityKnowledge: null,
  riskPerception: null,
  scamExperience: null,
  motivation: null,
}

export function Onboarding() {
  const { user, userDocument } = useAuth()
  const setUserDocument = useAuthStore((state) => state.setUserDocument)
  const navigate = useNavigate()
  // Passo 0 é o aviso da pesquisa; as perguntas começam no 1.
  const [stepIndex, setStepIndex] = useState(0)
  const [consent, setConsent] = useState<ConsentChoice>({ isAdult: false, accepted: false })
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Percepção de risco é dado só da pesquisa: quem não aceitou nem vê a pergunta.
  const questions = consent.accepted
    ? [KNOWLEDGE, RISK, SCAM, MOTIVATION]
    : [KNOWLEDGE, SCAM, MOTIVATION]
  const totalSteps = questions.length + 1
  const question = stepIndex > 0 ? questions[stepIndex - 1] : undefined
  const isLastStep = stepIndex === totalSteps - 1
  // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
  const allAnswered = questions.every(({ field }) => answers[field] !== null)
  const canAdvance = !question || (isLastStep ? allAnswered : answers[question.field] !== null)

  async function handleFinish() {
    if (!user || !allAnswered) return

    setIsSaving(true)
    setError(null)
    try {
      const fields = await completeOnboarding(
        user.uid,
        {
          securityKnowledge: answers.securityKnowledge,
          scamExperience: answers.scamExperience,
          motivation: answers.motivation,
        },
        {
          ...consent,
          ...(consent.accepted ? { riskPerception: answers.riskPerception } : {}),
        }
      )

      if (userDocument) {
        setUserDocument({ ...userDocument, onboardingCompleted: true, ...fields })
      }
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (caughtError) {
      reportResearchFailure('onboarding com consentimento', caughtError)
      setError(
        'Não conseguimos salvar suas respostas agora. Elas continuam aqui; tente concluir de novo.'
      )
      setIsSaving(false)
    }
  }

  return (
    <Card className="flex flex-col gap-6">
      {question ? (
        <div className="flex flex-col gap-2">
          <h1 className="page-title">Vamos te conhecer</h1>
          <p className="text-sm text-ink-soft">
            Perguntas rápidas pra gente entender seu ponto de partida.
          </p>
        </div>
      ) : (
        <ConsentForm text={CONSENT_TEXTS['onboarding-v2']} value={consent} onChange={setConsent} />
      )}

      <ProgressBar
        value={stepIndex + 1}
        max={totalSteps}
        label={`Passo ${stepIndex + 1} de ${totalSteps}`}
      />

      {question && (
        <ChoiceQuestion
          key={question.field}
          name={question.field}
          question={question.question}
          options={question.options}
          value={answers[question.field]}
          onChange={(value) => setAnswers((current) => ({ ...current, [question.field]: value }))}
        />
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
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
