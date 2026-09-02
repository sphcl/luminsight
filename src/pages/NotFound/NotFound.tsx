import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="max-w-md text-center">
        <p className="text-sm font-semibold text-primary-600">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Página não encontrada</h1>
        <p className="mt-2 text-sm text-slate-600">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <Button className="mt-6" onClick={() => navigate(ROUTES.HOME)}>
          Voltar para o início
        </Button>
      </Card>
    </div>
  )
}
