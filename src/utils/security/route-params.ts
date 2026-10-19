import { z } from 'zod'

// Os ids de conteúdo são todos no formato "modulo-01": qualquer coisa fora disso nem chega no Firestore.
const routeIdSchema = z.string().regex(/^[a-z0-9-]{1,64}$/)

export function parseRouteId(value: string | undefined): string | undefined {
  const result = routeIdSchema.safeParse(value)
  return result.success ? result.data : undefined
}
