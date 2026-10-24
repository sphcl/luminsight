import { useState } from 'react'
import { Button, Card } from '@/components/ui'
import { CONSENT_TEXTS } from '@/content/research'
import { useAuth } from '@/hooks/useAuth'
import { recordLateConsent } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import type { RiskPerception } from '@/types/user.types'
import { reportResearchFailure } from '../reportResearchFailure'
import { RISK_PERCEPTION_OPTIONS, RISK_PERCEPTION_QUESTION } from '../schemas/research.schema'
import { ChoiceQuestion } from './ChoiceQuestion'
import { ConsentForm, type ConsentChoice } from './ConsentForm'

const SAVE_ERROR =
  'Não conseguimos salvar sua escolha agora. O que você marcou continua aqui. Tente de novo daqui a pouco.'

// Aparece uma vez pra quem criou a conta antes do aviso existir; depois da escolha o site segue normal.
export function LateConsentGate({ onDecideLater }: { onDecideLater: () => void }) {
  const { user, userDocument } = useAuth()
  const setUserDocument = useAuthStore((state) => state.setUserDocument)
  const [consent, setConsent] = useState<ConsentChoice>({ isAdult: false, accepted: false })
  const [riskPerception, setRiskPerception] = useState<RiskPerception | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const canConfirm = !consent.accepted || riskPerception !== null

  async function handleConfirm() {
    if (!user || !userDocument || !canConfirm) return

    setIsSaving(true)
    setHasFailed(false)
    try {
      const fields = await recordLateConsent(user.uid, {
        ...consent,
        ...(consent.accepted && riskPerception ? { riskPerception } : {}),
      })
      setUserDocument({ ...userDocument, ...fields })
    } catch (caughtError) {
      reportResearchFailure('consentimento (aviso único)', caughtError)
      setHasFailed(true)
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card className="flex flex-col gap-6">
        <ConsentForm text={CONSENT_TEXTS['retroativo-v2']} value={consent} onChange={setConsent} />

        {consent.accepted && (
          <ChoiceQuestion
            name="riskPerception"
            question={RISK_PERCEPTION_QUESTION}
            options={RISK_PERCEPTION_OPTIONS}
            value={riskPerception}
            onChange={setRiskPerception}
          />
        )}

        {hasFailed && (
          <p role="alert" className="text-sm text-danger">
            {SAVE_ERROR}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {/* Só depois de uma falha: sem isso, gravação quebrada trancava a pessoa fora do site inteiro. */}
          {hasFailed && (
            <Button variant="secondary" onClick={onDecideLater} disabled={isSaving}>
              Decidir depois
            </Button>
          )}
          <Button onClick={() => void handleConfirm()} disabled={!canConfirm} isLoading={isSaving}>
            {consent.accepted ? 'Confirmar e continuar' : 'Continuar sem participar'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
