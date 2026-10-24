import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { REDIRECT_QUERY_PARAM } from '@/utils/security/redirect'
import { RouteLoadingFallback } from './RouteLoadingFallback'

// Guard das rotas autenticadas (Dashboard, Trilha, Módulo, etc.). Três
// desfechos possíveis, nessa ordem: ainda não sabemos se há sessão, não há
// sessão, ou há sessão mas o onboarding não foi concluído.
export function ProtectedRoute() {
  const { isInitializing, isAuthenticated, hasCompletedOnboarding } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <RouteLoadingFallback />
  }

  if (!isAuthenticated) {
    // pathname + search (não location completo) é o suficiente para
    // reconstruir a URL de origem depois do login; é montado aqui, a partir
    // da própria localização atual, então já nasce como caminho interno —
    // não precisa passar pela validação de getSafeRedirectPath.
    const origin = `${location.pathname}${location.search}`
    const loginUrl = `${ROUTES.LOGIN}?${REDIRECT_QUERY_PARAM}=${encodeURIComponent(origin)}`
    return <Navigate to={loginUrl} replace />
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  return <Outlet />
}
