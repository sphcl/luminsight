import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { primaryLinkClass } from '@/components/ui/linkStyles'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { dismissTrailFeedback, hasTrailFeedback } from '@/services/research.service'
import { useAuthStore } from '@/store/auth.store'
import { mapFirestoreError } from '@/utils/security/errors'

// Pra quem concluiu a trilha e pulou o encerramento, ou concluiu antes dele existir.
export function TrailFeedbackCard({ trailCompleted }: { trailCompleted: boolean }) {
  const { user, userDocument } = useAuth()
  const setUserDocument = useAuthStore((state) => state.setUserDocument)
  const isEligible =
    trailCompleted &&
    userDocument?.researchConsent?.accepted === true &&
    !userDocument.trailFeedbackDismissedAt
  const [hasAnswered, setHasAnswered] = useState<boolean | null>(null)
  const [isDismissing, setIsDismissing] = useState(false)

  useEffect(() => {
    if (!isEligible || !user) return
    let isCurrent = true
    hasTrailFeedback(user.uid)
      .then((answered) => isCurrent && setHasAnswered(answered))
      // Na dúvida não mostro: card de pesquisa nunca pode virar tela de erro no painel.
      .catch((caughtError: unknown) => {
        mapFirestoreError(caughtError)
        if (isCurrent) setHasAnswered(true)
      })
    return () => {
      isCurrent = false
    }
  }, [isEligible, user])

  if (!isEligible || hasAnswered !== false || !user || !userDocument) return null

  async function handleDismiss() {
    if (!user || !userDocument) return
    setIsDismissing(true)
    try {
      const trailFeedbackDismissedAt = await dismissTrailFeedback(user.uid)
      setUserDocument({ ...userDocument, trailFeedbackDismissedAt })
    } catch (caughtError) {
      mapFirestoreError(caughtError)
      setIsDismissing(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4" data-testid="trail-feedback-card">
      <div>
        <p className="eyebrow">Pesquisa final</p>
        <p className="mt-2 text-lg font-semibold text-ink">
          Você concluiu a trilha. Responde quatro perguntas rápidas?
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to={ROUTES.ENCERRAMENTO} className={primaryLinkClass}>
          Responder
        </Link>
        <Button variant="ghost" onClick={() => void handleDismiss()} isLoading={isDismissing}>
          Dispensar
        </Button>
      </div>
    </Card>
  )
}
