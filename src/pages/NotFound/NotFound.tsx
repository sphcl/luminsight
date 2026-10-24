import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-8">
      <div className="max-w-md">
        <p className="font-serif text-7xl font-normal leading-none text-ink-muted">404</p>
        <h1 className="page-title mt-4">Página não encontrada</h1>
        <p className="mt-3 text-ink-soft">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <Button className="mt-6" onClick={() => navigate(ROUTES.HOME)}>
          Voltar para o início
        </Button>
      </div>
    </div>
  )
}
