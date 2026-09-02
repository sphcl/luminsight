import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 p-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <Badge variant="primary">Educação em segurança digital</Badge>
        <h1 className="text-4xl font-extrabold text-slate-900">LumInsight</h1>
        <p className="max-w-xl text-base text-slate-600">
          Aprenda a reconhecer golpes, phishing e outras ameaças digitais através
          de trilhas, simulações realistas e quizzes práticos.
        </p>
      </header>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button fullWidth onClick={() => navigate(ROUTES.REGISTER)}>
            Criar conta grátis
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate(ROUTES.LOGIN)}>
            Já tenho conta
          </Button>
        </div>
      </Card>
    </div>
  )
}
