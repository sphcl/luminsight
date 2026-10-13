import { z } from 'zod'
import { displayNameField } from '@/features/auth/schemas/auth.schemas'

// Strict porque esse objeto é exatamente o que vai pro updateDoc: só displayName passa.
export const updateProfileSchema = z.object({ displayName: displayNameField }).strict()

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
