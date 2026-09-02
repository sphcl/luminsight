import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

export function Forbidden() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="max-w-md text-center">
        <p className="text-sm font-semibold text-danger-600">403</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Acesso não permitido</h1>
        <p className="mt-2 text-sm text-slate-600">
          Você não tem permissão para acessar esta página.
        </p>
        <Button className="mt-6" onClick={() => navigate(ROUTES.HOME)}>
          Voltar para o início
        </Button>
      </Card>
    </div>
  )
}
