import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { useAuthActions } from '../hooks/useAuthActions'
import { loginSchema } from '../schemas/auth.schemas'

interface LoginFormProps {
  onSuccess?: () => void
}

interface FieldErrors {
  email?: string
  password?: string
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, signInWithGoogle, isLoading, error } = useAuthActions()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    // safeParse antes de chamar o Firebase: evita round-trip de rede
    // pra um erro que a gente já detecta no cliente
    const result = loginSchema.safeParse({ email, password })

    if (!result.success) {
      const errors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field === 'email' || field === 'password') {
          // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    const success = await login(result.data.email, result.data.password)
    if (success) {
      onSuccess?.()
    }
  }

  async function handleGoogleClick() {
    const success = await signInWithGoogle()
    if (success) {
      onSuccess?.()
    }
  }

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
      />

      <Input
        label="Senha"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
      />

      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isLoading} fullWidth>
        Entrar
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={() => void handleGoogleClick()}
        disabled={isLoading}
        fullWidth
      >
        Entrar com Google
      </Button>
    </form>
  )
}
