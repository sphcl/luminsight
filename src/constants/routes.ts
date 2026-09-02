export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  TRILHA: '/trilha',
  MODULO: '/modulos/:moduleId',
  LICAO: '/modulos/:moduleId/licoes/:lessonId',
  QUIZ: '/quiz/:moduleId',
  SIMULACOES: '/simulacoes',
  SIMULACAO: '/simulacoes/:simulationId',
  PERFIL: '/perfil',
  CONQUISTAS: '/conquistas',
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

// Substitui os placeholders ":param" de um template de ROUTES pelo valor real,
// sempre passando por encodeURIComponent — um moduleId com "/", "?" ou "#"
// não pode acabar corrompendo o path ou virando um segmento de rota diferente.
function buildRoute(template: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (path, [param, value]) => path.replace(`:${param}`, encodeURIComponent(value)),
    template
  )
}

// Helpers para montar rotas com parâmetro a partir dos templates de ROUTES,
// em vez de concatenar strings manualmente espalhado pelo código (e correr o
// risco de um path divergir do template registrado aqui).
export function buildModuleRoute(moduleId: string): string {
  return buildRoute(ROUTES.MODULO, { moduleId })
}

export function buildLessonRoute(moduleId: string, lessonId: string): string {
  return buildRoute(ROUTES.LICAO, { moduleId, lessonId })
}

export function buildQuizRoute(moduleId: string): string {
  return buildRoute(ROUTES.QUIZ, { moduleId })
}

export function buildSimulationRoute(simulationId: string): string {
  return buildRoute(ROUTES.SIMULACAO, { simulationId })
}