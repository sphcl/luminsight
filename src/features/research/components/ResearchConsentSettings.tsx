import { useState } from 'react'
import { Button, Card } from '@/components/ui'
import { CONSENT_TEXTS } from '@/content/research'
import { useAuth } from '@/hooks/useAuth'
import { changeResearchConsent } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { reportResearchFailure } from '../reportResearchFailure'
import { ConsentForm, type ConsentChoice } from './ConsentForm'

// Revogar não apaga nada no banco: tira a pessoa da exportação, inclusive do que já foi gravado.
export function ResearchConsentSettings() {
  const { user, userDocument } = useAuth()
  const setUserDocument = useAuthStore((state) => state.setUserDocument)
  const consent = userDocument?.researchConsent
  const participates = consent?.accepted === true
  const [isEditing, setIsEditing] = useState(false)
  const [choice, setChoice] = useState<ConsentChoice>({ isAdult: false, accepted: false })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save(next: ConsentChoice) {
    if (!user || !userDocument) return
    setIsSaving(true)
    setError(null)
    try {
      const researchConsent = await changeResearchConsent(user.uid, next)
      setUserDocument({ ...userDocument, researchConsent })
      setIsEditing(false)
      setChoice({ isAdult: false, accepted: false })
    } catch (caughtError) {
      reportResearchFailure('consentimento (Perfil)', caughtError)
      setError('Não conseguimos salvar sua escolha agora. Tente de novo daqui a pouco.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section aria-labelledby="research-title" className="flex flex-col gap-3">
      <h2 id="research-title" className="text-lg font-semibold text-ink">
        Pesquisa do TCC
      </h2>
      <Card className="flex flex-col gap-4">
        <p className="text-ink">
          {participates
            ? 'Você participa da pesquisa.'
            : 'Você não participa da pesquisa. O site funciona igual para você.'}
        </p>

        {!isEditing && (
          <Button variant="secondary" className="self-start" onClick={() => setIsEditing(true)}>
            {participates ? 'Sair da pesquisa' : 'Participar da pesquisa'}
          </Button>
        )}

        {isEditing && participates && (
          <div className="flex flex-col gap-3 rounded-card bg-warning-soft p-4 text-ink">
            <p className="font-semibold">Se você sair da pesquisa:</p>
            <ul className="list-disc pl-5">
              <li>nenhum dado seu entra no trabalho, nem o que já foi gravado até agora;</li>
              <li>seu progresso no site continua exatamente como está.</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => void save({ accepted: false, isAdult: consent?.isAdult ?? false })}
                isLoading={isSaving}
              >
                Confirmar saída
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {isEditing && !participates && (
          <div className="flex flex-col gap-4 border-t border-rule pt-4">
            <ConsentForm
              text={CONSENT_TEXTS['retroativo-v2']}
              value={choice}
              onChange={setChoice}
              headingLevel="h2"
            />
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => void save(choice)}
                disabled={!choice.accepted}
                isLoading={isSaving}
              >
                Confirmar participação
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </Card>
    </section>
  )
}
