import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

export function Forbidden() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-8">
      <div className="max-w-md">
        <p className="font-serif text-7xl font-normal leading-none text-ink-muted">403</p>
        <h1 className="page-title mt-4">Acesso não permitido</h1>
        <p className="mt-3 text-ink-soft">Você não tem permissão para acessar esta página.</p>
        <Button className="mt-6" onClick={() => navigate(ROUTES.HOME)}>
          Voltar para o início
        </Button>
      </div>
    </div>
  )
}
