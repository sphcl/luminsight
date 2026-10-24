import { Link, useLocation, useNavigate } from 'react-router-dom'
import { textLinkClass } from '@/components/ui/linkStyles'
import { ROUTES } from '@/constants/routes'
import { LoginForm } from '@/features/auth'
import { useRedirectTarget } from '@/lib/router/useRedirectTarget'

export function Login() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const redirectTarget = useRedirectTarget()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-4xl font-normal tracking-[-0.025em] text-ink">Entrar</h1>
        <p className="mt-2 text-ink-soft">Acesse sua conta para continuar aprendendo.</p>
      </div>

      <LoginForm onSuccess={() => navigate(redirectTarget, { replace: true })} />

      {/* Levo o ?redirect= junto pra quem trocar de tela no meio não perder pra onde ia voltar. */}
      <p className="text-center text-sm text-ink-soft">
        Ainda não tem conta?{' '}
        <Link to={{ pathname: ROUTES.REGISTER, search }} className={textLinkClass}>
          Criar conta
        </Link>
      </p>
    </div>
  )
}
