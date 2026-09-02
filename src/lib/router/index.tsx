// Este módulo configura o router (exporta `router`, não um componente) e
// guarda vários `lazy()` em consts locais — não é um arquivo de componentes,
// então a garantia de fast refresh que essa regra protege não se aplica aqui.
/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import type { ReactElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout, AuthLayout } from '@/components/layout'
import { ROUTES } from '@/constants/routes'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { RouteError } from '@/pages/RouteError'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { OnboardingRoute } from './OnboardingRoute'
import { RouteLoadingFallback } from './RouteLoadingFallback'

// Landing, Login e Register carregam sempre, sem code-splitting: são a
// primeira impressão do site (ou o que aparece assim que alguém tenta abrir
// qualquer rota protegida sem sessão), então não podem esperar por um
// chunk extra. Todo o resto é lazy — só baixa quando o usuário navega até lá.
//
// As páginas exportam nomeado (export function X), não default, seguindo o
// mesmo padrão do resto do projeto (@/components/ui, @/features/auth); por
// isso cada import() precisa mapear o módulo para o formato { default }
// que React.lazy exige.
const Onboarding = lazy(() =>
  import('@/pages/Onboarding').then((module) => ({ default: module.Onboarding }))
)
const Dashboard = lazy(() =>
  import('@/pages/Dashboard').then((module) => ({ default: module.Dashboard }))
)
const Trilha = lazy(() => import('@/pages/Trilha').then((module) => ({ default: module.Trilha })))
const Modulo = lazy(() => import('@/pages/Modulo').then((module) => ({ default: module.Modulo })))
const Licao = lazy(() => import('@/pages/Licao').then((module) => ({ default: module.Licao })))
const Quiz = lazy(() => import('@/pages/Quiz').then((module) => ({ default: module.Quiz })))
const Simulacoes = lazy(() =>
  import('@/pages/Simulacoes').then((module) => ({ default: module.Simulacoes }))
)
const Simulacao = lazy(() =>
  import('@/pages/Simulacao').then((module) => ({ default: module.Simulacao }))
)
const Perfil = lazy(() => import('@/pages/Perfil').then((module) => ({ default: module.Perfil })))
const NotFound = lazy(() =>
  import('@/pages/NotFound').then((module) => ({ default: module.NotFound }))
)
const Forbidden = lazy(() =>
  import('@/pages/Forbidden').then((module) => ({ default: module.Forbidden }))
)

function withSuspense(element: ReactElement): ReactElement {
  return <Suspense fallback={<RouteLoadingFallback />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    // Rota raiz sem path nem element próprio: existe só para dar um
    // errorElement único que cobre qualquer erro de render/loader de
    // qualquer página abaixo (RouteError fica de fora do lazy loading —
    // ver comentário no próprio arquivo). Sem element, o React Router
    // renderiza um <Outlet /> implícito para os filhos.
    errorElement: <RouteError />,
    children: [
      { path: ROUTES.HOME, element: <Landing /> },

      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: ROUTES.LOGIN, element: <Login /> },
              { path: ROUTES.REGISTER, element: <Register /> },
            ],
          },
        ],
      },

      {
        element: <OnboardingRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [{ path: ROUTES.ONBOARDING, element: withSuspense(<Onboarding />) }],
          },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: ROUTES.DASHBOARD, element: withSuspense(<Dashboard />) },
              { path: ROUTES.TRILHA, element: withSuspense(<Trilha />) },
              { path: ROUTES.MODULO, element: withSuspense(<Modulo />) },
              { path: ROUTES.LICAO, element: withSuspense(<Licao />) },
              { path: ROUTES.QUIZ, element: withSuspense(<Quiz />) },
              { path: ROUTES.SIMULACOES, element: withSuspense(<Simulacoes />) },
              { path: ROUTES.SIMULACAO, element: withSuspense(<Simulacao />) },
              { path: ROUTES.PERFIL, element: withSuspense(<Perfil />) },
            ],
          },
        ],
      },

      { path: ROUTES.FORBIDDEN, element: withSuspense(<Forbidden />) },
      { path: '*', element: withSuspense(<NotFound />) },
    ],
  },
])
