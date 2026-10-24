import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

// errorElement da rota raiz: pega qualquer erro não tratado que aconteça
// durante render/loader de qualquer rota da árvore (inclusive falha ao
// carregar o chunk de uma página lazy). Fica de fora do lazy loading de
// propósito — se o carregamento sob demanda falhar, essa tela não pode
// depender de outro carregamento sob demanda para aparecer.
export function RouteError() {
  const navigate = useNavigate()
  const error = useRouteError()

  if (import.meta.env.DEV) {
    console.error('[router]', error)
  }

  const message = isRouteErrorResponse(error)
    ? error.statusText || `Erro ${error.status}`
    : 'Ocorreu um erro inesperado.'

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-8">
      <div className="max-w-md">
        <h1 className="page-title">Algo deu errado</h1>
        <p className="mt-3 text-ink-soft">{message}</p>
        <Button className="mt-6" onClick={() => navigate(ROUTES.HOME)}>
          Voltar para o início
        </Button>
      </div>
    </div>
  )
}
