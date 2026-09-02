import { z } from 'zod'

// Regex aceita letras (com acentos), espaços, apóstrofo e hífen — bloqueia
// números e símbolos de markup como < > para não deixar passar tentativa de XSS no nome
const NAME_REGEX = /^[\p{L}\s'-]+$/u

const emailField = z
  .string()
  .trim()
  .min(1, 'Informe o email.')
  .max(254, 'Email muito longo.') // limite do RFC 5321, evita payloads absurdos
  .email('Informe um email válido.')

export const loginSchema = z.object({
  email: emailField,
  // Na tela de login não validamos regra de senha (tamanho, complexidade):
  // isso vazaria a política de senha para quem está tentando enumerar contas
  password: z.string().min(1, 'Informe a senha.'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, 'O nome deve ter pelo menos 2 caracteres.')
      .max(60, 'O nome deve ter no máximo 60 caracteres.')
      .regex(NAME_REGEX, 'O nome não pode conter números ou símbolos.'),
    email: emailField,
    // No cadastro sim validamos tamanho: min 8 é segurança básica,
    // max 128 evita DoS por hashing (senhas gigantes custam CPU no bcrypt/scrypt do Firebase)
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres.')
      .max(128, 'A senha deve ter no máximo 128 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>
