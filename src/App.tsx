import { useState } from 'react'
import { Badge, Button, Card } from '@/components/ui'
import { LoginForm, RegisterForm } from '@/features/auth'
import { useAuth } from '@/hooks/useAuth'
import { useAuthActions } from '@/features/auth/hooks/useAuthActions'

type AuthTab = 'login' | 'register'

// Tela temporária só pra validar o fluxo de autenticação de ponta a ponta.
// Na Fase 4 isso vira roteamento de verdade com React Router.
function App() {
  const { user, userDocument, isInitializing, isAuthenticated } = useAuth()
  const { logout, isLoading: isLoggingOut } = useAuthActions()
  const [activeTab, setActiveTab] = useState<AuthTab>('login')

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Carregando sessão...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <header>
          <h1 className="text-3xl font-extrabold text-slate-900">LumInsight</h1>
          <p className="text-sm text-slate-500">Fase 3 — Autenticação (tela de validação)</p>
        </header>

        {isAuthenticated ? (
          <Card>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="success">Autenticado</Badge>
                <Badge>{userDocument?.role ?? 'user'}</Badge>
              </div>

              <div className="flex flex-col gap-1 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">UID:</span> {user?.uid}
                </p>
                <p>
                  <span className="font-semibold">Nome:</span>{' '}
                  {userDocument?.displayName ?? '—'}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>
                <p>
                  <span className="font-semibold">Onboarding concluído:</span>{' '}
                  {userDocument?.onboardingCompleted ? 'sim' : 'não'}
                </p>
              </div>

              <Button
                variant="secondary"
                isLoading={isLoggingOut}
                onClick={() => void logout()}
                fullWidth
              >
                Sair
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="mb-4 flex gap-2">
              <Button
                variant={activeTab === 'login' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('login')}
              >
                Entrar
              </Button>
              <Button
                variant={activeTab === 'register' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('register')}
              >
                Criar conta
              </Button>
            </div>

            {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
          </Card>
        )}
      </div>
    </div>
  )
}

export default App
