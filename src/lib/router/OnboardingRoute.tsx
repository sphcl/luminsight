import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { RouteLoadingFallback } from './RouteLoadingFallback'

// Guard exclusivo de /onboarding: exige autenticação, mas de propósito NÃO
// exige onboarding concluído — se exigisse, ProtectedRoute mandaria pra cá
// e esse guard mandaria de volta pra lá, num loop infinito de redirect.
export function OnboardingRoute() {
  const { isInitializing, isAuthenticated, hasCompletedOnboarding } = useAuth()

  if (isInitializing) {
    return <RouteLoadingFallback />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (hasCompletedOnboarding) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
