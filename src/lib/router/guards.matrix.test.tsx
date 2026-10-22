import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { OnboardingRoute } from './OnboardingRoute'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')

type SessionState = 'carregando' | 'anônimo' | 'sem onboarding' | 'completo'

const SESSION: Record<SessionState, ReturnType<typeof useAuth>> = {
  carregando: {
    user: null,
    userDocument: null,
    isInitializing: true,
    isAuthenticated: false,
    hasCompletedOnboarding: false,
  },
  anônimo: {
    user: null,
    userDocument: null,
    isInitializing: false,
    isAuthenticated: false,
    hasCompletedOnboarding: false,
  },
  'sem onboarding': {
    user: null,
    userDocument: null,
    isInitializing: false,
    isAuthenticated: true,
    hasCompletedOnboarding: false,
  },
  completo: {
    user: null,
    userDocument: null,
    isInitializing: false,
    isAuthenticated: true,
    hasCompletedOnboarding: true,
  },
}

// Uma tela por rota pra saber exatamente onde cada guard deixou o usuário.
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<p>tela:login</p>} />
        </Route>
        <Route element={<OnboardingRoute />}>
          <Route path="/onboarding" element={<p>tela:onboarding</p>} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>tela:dashboard</p>} />
          <Route path="/trilha" element={<p>tela:trilha</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

// Cada linha: estado da sessão, rota pedida, onde o usuário tem que terminar.
const MATRIX: [SessionState, string, string][] = [
  ['carregando', '/trilha', 'Carregando...'],
  ['carregando', '/login', 'Carregando...'],
  ['carregando', '/onboarding', 'Carregando...'],
  ['anônimo', '/trilha', 'tela:login'],
  ['anônimo', '/login', 'tela:login'],
  ['anônimo', '/onboarding', 'tela:login'],
  ['sem onboarding', '/trilha', 'tela:onboarding'],
  ['sem onboarding', '/login', 'tela:onboarding'],
  ['sem onboarding', '/onboarding', 'tela:onboarding'],
  ['completo', '/trilha', 'tela:trilha'],
  ['completo', '/login', 'tela:dashboard'],
  ['completo', '/onboarding', 'tela:dashboard'],
]

describe('guards de rota', () => {
  it.each(MATRIX)('sessão %s pedindo %s termina em %s', (session, path, expected) => {
    // eslint-disable-next-line security/detect-object-injection -- chave restrita por union type
    vi.mocked(useAuth).mockReturnValue(SESSION[session])

    renderAt(path)

    expect(screen.getByText(expected)).toBeInTheDocument()
    for (const other of ['tela:login', 'tela:onboarding', 'tela:dashboard', 'tela:trilha']) {
      if (other !== expected) expect(screen.queryByText(other)).not.toBeInTheDocument()
    }
  })

  it('usuário logado com redirect malicioso no login vai pro dashboard, não pra fora', () => {
    vi.mocked(useAuth).mockReturnValue(SESSION.completo)

    renderAt('/login?redirect=%2F%09%2Fevil.com')

    expect(screen.getByText('tela:dashboard')).toBeInTheDocument()
  })
})
