import { useId, useState } from 'react'
import { ZodError } from 'zod'
import { Button, Card } from '@/components/ui'
import { choiceOptionClass } from '@/components/ui/choiceStyles'
import { SECURITY_KNOWLEDGE_OPTIONS } from '@/features/onboarding/schemas/onboarding.schema'
import { saveTrailFeedback } from '@/services/research.service'
import { mapFirestoreError } from '@/utils/security/errors'
import type { Satisfaction, UsefulPart } from '@/types/research.types'
import type { RiskPerception, SecurityKnowledge } from '@/types/user.types'
import {
  COMMENT_MAX_LENGTH,
  RISK_PERCEPTION_OPTIONS,
  RISK_PERCEPTION_QUESTION,
  SATISFACTION_OPTIONS,
  USEFUL_PART_OPTIONS,
} from '../schemas/research.schema'
import { ChoiceQuestion } from './ChoiceQuestion'

interface TrailClosingProps {
  uid: string
  onSkip: () => void
}

// Pós-teste com as mesmas perguntas e alternativas do onboarding, mais a satisfação. Pular não trava nada.
export function TrailClosing({ uid, onSkip }: TrailClosingProps) {
  const commentId = useId()
  const [knowledge, setKnowledge] = useState<SecurityKnowledge | null>(null)
  const [risk, setRisk] = useState<RiskPerception | null>(null)
  const [satisfaction, setSatisfaction] = useState<Satisfaction | null>(null)
  const [useful, setUseful] = useState<UsefulPart[]>([])
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'editing' | 'saving' | 'sent'>('editing')
  const [error, setError] = useState<string | null>(null)

  const isComplete = knowledge && risk && satisfaction && useful.length > 0

  // "Nada em especial" é exclusiva: marcar ela limpa as outras, e marcar outra limpa ela.
  function toggleUseful(part: UsefulPart) {
    setUseful((current) => {
      if (current.includes(part)) return current.filter((item) => item !== part)
      if (part === 'nada') return ['nada']
      return [...current.filter((item) => item !== 'nada'), part]
    })
  }

  async function handleSubmit() {
    if (!isComplete) return
    setStatus('saving')
    setError(null)
    try {
      await saveTrailFeedback(uid, {
        securityKnowledge: knowledge,
        riskPerception: risk,
        satisfaction,
        mostUseful: useful,
        comment,
      })
      setStatus('sent')
    } catch (caughtError) {
      if (caughtError instanceof ZodError) {
        setError('Revise suas respostas e tente de novo.')
      } else {
        mapFirestoreError(caughtError)
        setError('Não foi possível enviar suas respostas. Tente novamente.')
      }
      setStatus('editing')
    }
  }

  if (status === 'sent') {
    return (
      <Card role="status" className="flex flex-col gap-2">
        <p className="text-lg font-semibold text-ink">Agradecemos suas respostas!</p>
        <p className="text-ink-soft">Suas respostas vão ajudar a melhorar o LumInsight.</p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-ink">Antes de ir, quatro perguntas</h2>
        <p className="text-ink-soft">
          As duas primeiras são as mesmas do começo da trilha, pra comparar antes e depois. Se
          preferir, pode pular.
        </p>
      </div>

      <ChoiceQuestion
        name="closing-knowledge"
        question="Qual seu nível de conhecimento sobre segurança digital?"
        options={SECURITY_KNOWLEDGE_OPTIONS}
        value={knowledge}
        onChange={setKnowledge}
      />
      <ChoiceQuestion
        name="closing-risk"
        question={RISK_PERCEPTION_QUESTION}
        options={RISK_PERCEPTION_OPTIONS}
        value={risk}
        onChange={setRisk}
      />
      <ChoiceQuestion
        name="closing-satisfaction"
        question="O que você achou da trilha?"
        options={SATISFACTION_OPTIONS}
        value={satisfaction}
        onChange={setSatisfaction}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-semibold text-ink">O que foi mais útil para você?</legend>
        <p className="mb-2 text-sm text-ink-soft">Pode marcar mais de uma.</p>
        {USEFUL_PART_OPTIONS.map((option) => (
          <label key={option.value} className={choiceOptionClass}>
            <input
              type="checkbox"
              checked={useful.includes(option.value)}
              onChange={() => toggleUseful(option.value)}
              className="accent-accent"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={commentId} className="font-semibold text-ink">
          Quer deixar um comentário? (opcional)
        </label>
        <textarea
          id={commentId}
          value={comment}
          maxLength={COMMENT_MAX_LENGTH}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          aria-describedby={`${commentId}-count`}
          className="rounded-none border border-control bg-surface p-3.5 text-base text-ink"
        />
        <p id={`${commentId}-count`} className="text-sm text-ink-muted">
          {comment.length} de {COMMENT_MAX_LENGTH} caracteres
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onSkip} disabled={status === 'saving'}>
          Pular
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          disabled={!isComplete}
          isLoading={status === 'saving'}
        >
          Enviar respostas
        </Button>
      </div>
    </Card>
  )
}
