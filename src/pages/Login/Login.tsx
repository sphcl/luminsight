import { useNavigate } from 'react-router-dom'
import { LoginForm } from '@/features/auth'
import { useRedirectTarget } from '@/lib/router/useRedirectTarget'

export function Login() {
  const navigate = useNavigate()
  const redirectTarget = useRedirectTarget()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>
        <p className="text-sm text-slate-500">Acesse sua conta para continuar aprendendo.</p>
      </div>

      <LoginForm onSuccess={() => navigate(redirectTarget, { replace: true })} />
    </div>
  )
}
