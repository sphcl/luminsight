import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { RouteLoadingFallback } from './RouteLoadingFallback'
import { useRedirectTarget } from './useRedirectTarget'

// Guard das rotas só-para-quem-não-está-logado (Login, Register). Quem já
// tem sessão ativa não deve ver o formulário de novo — é mandado para o
// destino original (?redirect=, já validado) ou para o Dashboard.
export function PublicOnlyRoute() {
  const { isInitializing, isAuthenticated } = useAuth()
  const redirectTarget = useRedirectTarget()

  if (isInitializing) {
    return <RouteLoadingFallback />
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTarget} replace />
  }

  return <Outlet />
}
