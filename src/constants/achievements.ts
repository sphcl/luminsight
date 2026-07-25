export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_lesson',
    title: 'Primeiro Passo',
    description: 'Completou sua primeira lição',
    icon: '🎯',
  },
  {
    id: 'quiz_perfect',
    title: 'Nota Máxima',
    description: '100% de acerto em um quiz',
    icon: '⭐',
  },
  {
    id: 'phishing_immune',
    title: 'Antiphishing',
    description: 'Simulação de email sem erros',
    icon: '🛡️',
  },
  {
    id: 'streak_3',
    title: 'Constância',
    description: '3 dias seguidos de acesso',
    icon: '🔥',
  },
  {
    id: 'streak_7',
    title: 'Dedicação',
    description: '7 dias seguidos de acesso',
    icon: '🔥',
  },
  {
    id: 'module_3',
    title: 'Comprometido',
    description: 'Completou 3 módulos',
    icon: '📚',
  },
  {
    id: 'all_modules',
    title: 'Missão Cumprida',
    description: 'Completou todos os módulos',
    icon: '🏆',
  },
  {
    id: 'all_simulations',
    title: 'Indetectável',
    description: 'Completou todas as simulações',
    icon: '🕵️',
  },
  {
    id: 'all_perfect',
    title: 'Perfeccionista',
    description: '100% em todos os quizzes',
    icon: '💎',
  },
  {
    id: 'fast_learner',
    title: 'Leitor Veloz',
    description: 'Uma lição em menos de 2 minutos',
    icon: '⚡',
  },
  {
    id: 'level_5',
    title: 'Especialista',
    description: 'Atingiu o nível 5',
    icon: '🎖️',
  },
]