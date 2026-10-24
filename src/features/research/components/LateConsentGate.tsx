import { useState } from 'react'
import { ZodError } from 'zod'
import { Button, Card } from '@/components/ui'
import { CONSENT_TEXTS } from '@/content/research'
import { useAuth } from '@/hooks/useAuth'
import { recordLateConsent } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { mapFirestoreError } from '@/utils/security/errors'
import type { RiskPerception } from '@/types/user.types'
import { RISK_PERCEPTION_OPTIONS, RISK_PERCEPTION_QUESTION } from '../schemas/research.schema'
import { ChoiceQuestion } from './ChoiceQuestion'
import { ConsentForm, type ConsentChoice } from './ConsentForm'

// Aparece uma vez pra quem criou a conta antes do aviso existir; depois da escolha o site segue normal.
export function LateConsentGate() {
  const { user, userDocument } = useAuth()
  const setUserDocument = useAuthStore((state) => state.setUserDocument)
  const [consent, setConsent] = useState<ConsentChoice>({ isAdult: false, accepted: false })
  const [riskPerception, setRiskPerception] = useState<RiskPerception | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canConfirm = !consent.accepted || riskPerception !== null

  async function handleConfirm() {
    if (!user || !userDocument || !canConfirm) return

    setIsSaving(true)
    setError(null)
    try {
      const fields = await recordLateConsent(user.uid, {
        ...consent,
        ...(consent.accepted && riskPerception ? { riskPerception } : {}),
      })
      setUserDocument({ ...userDocument, ...fields })
    } catch (caughtError) {
      if (!(caughtError instanceof ZodError)) mapFirestoreError(caughtError)
      setError('Não foi possível salvar sua escolha. Tente novamente.')
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card className="flex flex-col gap-6">
        <ConsentForm text={CONSENT_TEXTS['retroativo-v1']} value={consent} onChange={setConsent} />

        {consent.accepted && (
          <ChoiceQuestion
            name="riskPerception"
            question={RISK_PERCEPTION_QUESTION}
            options={RISK_PERCEPTION_OPTIONS}
            value={riskPerception}
            onChange={setRiskPerception}
          />
        )}

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <Button
          className="self-end"
          onClick={() => void handleConfirm()}
          disabled={!canConfirm}
          isLoading={isSaving}
        >
          {consent.accepted ? 'Confirmar e continuar' : 'Continuar sem participar'}
        </Button>
      </Card>
    </div>
  )
}
