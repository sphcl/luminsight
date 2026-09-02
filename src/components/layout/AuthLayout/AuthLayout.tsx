import { Outlet } from 'react-router-dom'

// Layout minimalista e centralizado para Login, Register e Onboarding:
// logo no topo, conteúdo da rota atual centralizado embaixo.
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted p-6">
      <div className="mb-8 flex flex-col items-center gap-1">
        <span className="text-2xl font-extrabold text-slate-900">LumInsight</span>
        <p className="text-sm text-slate-500">Educação em segurança digital</p>
      </div>

      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
