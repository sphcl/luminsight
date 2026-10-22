import { useNavigate } from 'react-router-dom'
import { RegisterForm } from '@/features/auth'
import { useRedirectTarget } from '@/lib/router/useRedirectTarget'

export function Register() {
  const navigate = useNavigate()
  const redirectTarget = useRedirectTarget()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-4xl font-normal tracking-[-0.025em] text-ink">
          Criar conta
        </h1>
        <p className="mt-2 text-ink-soft">Comece sua trilha de aprendizado em minutos.</p>
      </div>

      {/* Conta nova sempre cai em /onboarding via ProtectedRoute (onboardingCompleted
          nasce false), então navegar para o redirectTarget aqui é seguro mesmo
          quando ele aponta pra uma rota protegida — o guard encadeia o redirecionamento. */}
      <RegisterForm onSuccess={() => navigate(redirectTarget, { replace: true })} />
    </div>
  )
}
