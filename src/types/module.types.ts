export type ModuleDifficulty = 'iniciante' | 'intermediario' | 'avancado'

// Documento da coleção "modules": conteúdo estático da trilha, gerenciado
// via script de seed (Admin SDK), nunca escrito pelo client.
export interface ModuleDocument {
  title: string
  description: string
  order: number
  icon: string
  color: string
  difficulty: ModuleDifficulty
  estimatedMinutes: number
  totalLessons: number
  isActive: boolean
  // Aponta para o id do módulo que precisa estar concluído antes deste
  // liberar na trilha. null = módulo sempre disponível (ex.: o primeiro).
  requiredModuleId: string | null
}

export type HighlightVariant = 'info' | 'warning' | 'danger'

// Bloco de conteúdo de uma lição. Discriminated union por "type" para que
// o renderizador (Fase 7) faça um switch exaustivo sem type assertions.
export type ContentBlock =
  | { type: 'text'; content: string }
  | { type: 'heading'; content: string }
  | { type: 'highlight'; content: string; variant: HighlightVariant }
  | { type: 'list'; items: string[]; ordered: boolean }
  | { type: 'example'; title: string; content: string }
  | { type: 'fact'; content: string; source: string }

// Documento da subcoleção "modules/{moduleId}/lessons": o path já amarra a
// lição ao módulo, então não guardamos moduleId de novo como campo.
export interface LessonDocument {
  title: string
  order: number
  content: ContentBlock[]
  estimatedMinutes: number
  readingTimeSeconds: number
}

// O SDK do Firestore devolve dados e id do documento separados; a maior
// parte da UI precisa dos dois juntos (ex.: navegar para /modulos/{id}).
export type WithId<T> = T & { id: string }

export type ModuleWithId = WithId<ModuleDocument>
export type LessonWithId = WithId<LessonDocument>
