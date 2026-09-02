import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Button, Input } from '@/components/ui'
import { useAuthActions } from '../hooks/useAuthActions'
import { registerSchema } from '../schemas/auth.schemas'

interface RegisterFormProps {
  onSuccess?: () => void
}

interface FieldErrors {
  displayName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register, isLoading, error } = useAuthActions()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = registerSchema.safeParse({
      displayName,
      email,
      password,
      confirmPassword,
    })

    if (!result.success) {
      const errors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (
          field === 'displayName' ||
          field === 'email' ||
          field === 'password' ||
          field === 'confirmPassword'
        ) {
          // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    const success = await register(result.data.displayName, result.data.email, result.data.password)
    if (success) {
      onSuccess?.()
    }
  }

  return (
    <form noValidate onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <Input
        label="Nome"
        type="text"
        autoComplete="name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        error={fieldErrors.displayName}
      />

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
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
        hint="Mínimo de 8 caracteres."
      />

      <Input
        label="Confirmar senha"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={fieldErrors.confirmPassword}
      />

      {error && (
        <p role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isLoading} fullWidth>
        Criar conta
      </Button>
    </form>
  )
}
