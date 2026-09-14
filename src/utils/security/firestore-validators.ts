import { z } from 'zod'
import { Timestamp } from 'firebase/firestore'
import type { ModuleDocument, LessonDocument } from '@/types/module.types'
import type { ProgressDocument } from '@/types/progress.types'

// Dado lido do Firestore não é confiável por padrão: um doc gravado errado
// (script de seed com bug, edição manual no console) chegaria direto na UI
// e quebraria em runtime. Cada schema abaixo espelha um *Document de
// src/types e é checado com `satisfies` para o TypeScript acusar na hora se
// o schema e o tipo divergirem.

const timestampSchema = z.custom<Timestamp>((value) => value instanceof Timestamp, {
  message: 'Esperado um Timestamp do Firestore.',
})

const moduleDifficultySchema = z.enum(['iniciante', 'intermediario', 'avancado'])

const moduleSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
  icon: z.string(),
  color: z.string(),
  difficulty: moduleDifficultySchema,
  estimatedMinutes: z.number(),
  totalLessons: z.number(),
  isActive: z.boolean(),
  requiredModuleId: z.string().nullable(),
}) satisfies z.ZodType<ModuleDocument>

const contentBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), content: z.string() }),
  z.object({ type: z.literal('heading'), content: z.string() }),
  z.object({
    type: z.literal('highlight'),
    content: z.string(),
    variant: z.enum(['info', 'warning', 'danger']),
  }),
  z.object({
    type: z.literal('list'),
    items: z.array(z.string()),
    ordered: z.boolean(),
  }),
  z.object({ type: z.literal('example'), title: z.string(), content: z.string() }),
  z.object({ type: z.literal('fact'), content: z.string(), source: z.string() }),
])

const lessonSchema = z.object({
  title: z.string(),
  order: z.number(),
  content: z.array(contentBlockSchema),
  estimatedMinutes: z.number(),
  readingTimeSeconds: z.number(),
}) satisfies z.ZodType<LessonDocument>

const progressSchema = z.object({
  startedAt: timestampSchema,
  completedAt: timestampSchema.nullable(),
  lessonsCompleted: z.array(z.string()),
  quizBestScore: z.number().nullable(),
  quizAttempts: z.number(),
  simulationCompleted: z.boolean(),
  lastUpdatedAt: timestampSchema,
}) satisfies z.ZodType<ProgressDocument>

// Nunca lança: um documento malformado vira null, e quem chamou decide o que
// fazer (pular o item, mostrar erro genérico, etc.) em vez de derrubar a tela.
export function parseModule(raw: unknown): ModuleDocument | null {
  const result = moduleSchema.safeParse(raw)
  return result.success ? result.data : null
}

export function parseLesson(raw: unknown): LessonDocument | null {
  const result = lessonSchema.safeParse(raw)
  return result.success ? result.data : null
}

export function parseProgress(raw: unknown): ProgressDocument | null {
  const result = progressSchema.safeParse(raw)
  return result.success ? result.data : null
}
