import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth'
import { useRedirectTarget } from '@/lib/router/useRedirectTarget'

export function Login() {
  const navigate = useNavigate()
  const redirectTarget = useRedirectTarget()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-4xl font-normal tracking-[-0.025em] text-ink">Entrar</h1>
        <p className="mt-2 text-ink-soft">Acesse sua conta para continuar aprendendo.</p>
      </div>

      <LoginForm onSuccess={() => navigate(redirectTarget, { replace: true })} />
    </div>
  )
}
