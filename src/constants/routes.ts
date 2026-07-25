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