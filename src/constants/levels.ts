export interface Level {
  level: number
  title: string
  minXp: number
  maxXp: number
}

export const LEVELS: Level[] = [
  { level: 1, title: 'Iniciante Digital', minXp: 0, maxXp: 99 },
  { level: 2, title: 'Navegador Consciente', minXp: 100, maxXp: 249 },
  { level: 3, title: 'Detector de Ameaças', minXp: 250, maxXp: 499 },
  { level: 4, title: 'Analista de Golpes', minXp: 500, maxXp: 899 },
  { level: 5, title: 'Especialista em Segurança', minXp: 900, maxXp: 1399 },
  { level: 6, title: 'Guardião Digital', minXp: 1400, maxXp: 1999 },
  { level: 7, title: 'Mestre da Segurança', minXp: 2000, maxXp: Infinity },
]

export const MAX_LEVEL = 7