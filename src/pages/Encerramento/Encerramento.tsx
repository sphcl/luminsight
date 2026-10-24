import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Card, Skeleton } from '@/components/ui'
import { primaryLinkClass } from '@/components/ui/linkStyles'
import { ROUTES } from '@/constants/routes'
import { MODULE_05_ID } from '@/content/modules/module-05'
import { TrailClosing } from '@/features/research/components/TrailClosing'
import { useAuth } from '@/hooks/useAuth'
import { getUserProgress } from '@/services/progress.service'
import { hasTrailFeedback } from '@/services/research.service'
import { mapFirestoreError } from '@/utils/security/errors'
import { cn } from '@/utils/helpers/classnames'

type State = 'loading' | 'ready' | 'answered' | 'not_completed' | 'error'

// Caminho de volta pro encerramento: quem pulou na hora ou concluiu a trilha antes dele existir.
export function Encerramento() {
  const { user, userDocument } = useAuth()
  const navigate = useNavigate()
  const participates = userDocument?.researchConsent?.accepted === true
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    if (!user || !participates) return
    let isCurrent = true

    void (async () => {
      try {
        const [answered, progressMap] = await Promise.all([
          hasTrailFeedback(user.uid),
          getUserProgress(user.uid),
        ])
        if (!isCurrent) return
        // eslint-disable-next-line security/detect-object-injection -- chave é constante do conteúdo
        const completed = (progressMap[MODULE_05_ID]?.completedAt ?? null) !== null
        setState(answered ? 'answered' : completed ? 'ready' : 'not_completed')
      } catch (caughtError) {
        mapFirestoreError(caughtError)
        if (isCurrent) setState('error')
      }
    })()

    return () => {
      isCurrent = false
    }
  }, [user, participates])

  if (!participates) return <Navigate to={ROUTES.DASHBOARD} replace />

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="page-title">Encerramento da trilha</h1>

      {state === 'loading' && <Skeleton className="h-64 w-full rounded-card" />}

      {state === 'ready' && user && (
        <TrailClosing uid={user.uid} onSkip={() => navigate(ROUTES.DASHBOARD)} />
      )}

      {state !== 'loading' && state !== 'ready' && (
        <Card className="flex flex-col gap-4">
          <p className="text-ink-soft">
            {state === 'answered' && 'Você já respondeu a pesquisa final. Agradecemos!'}
            {state === 'not_completed' && 'A pesquisa final abre quando você concluir a trilha.'}
            {state === 'error' && 'Não foi possível carregar a pesquisa agora. Tente mais tarde.'}
          </p>
          <Link
            to={state === 'not_completed' ? ROUTES.TRILHA : ROUTES.DASHBOARD}
            className={cn(primaryLinkClass, 'self-start')}
          >
            {state === 'not_completed' ? 'Ir para a trilha' : 'Voltar ao painel'}
          </Link>
        </Card>
      )}
    </div>
  )
}
