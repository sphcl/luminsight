import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useSearchParams } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')

const mockedUseAuth = vi.mocked(useAuth)

function LoginStub() {
  const [searchParams] = useSearchParams()
  return <p>redirect={searchParams.get('redirect')}</p>
}

function renderProtectedRoute(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>Conteúdo protegido</p>} />
        </Route>
        <Route path="/login" element={<LoginStub />} />
        <Route path="/onboarding" element={<p>Tela de onboarding</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('mostra o fallback de carregamento enquanto isInitializing', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: true,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    })

    renderProtectedRoute()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('redireciona para /login quando não autenticado', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    })

    renderProtectedRoute()
    expect(screen.getByText('redirect=/dashboard')).toBeInTheDocument()
  })

  it('preserva query string da URL de origem no ?redirect=', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    })

    renderProtectedRoute('/dashboard?tab=modulos')
    expect(screen.getByText('redirect=/dashboard?tab=modulos')).toBeInTheDocument()
  })

  it('redireciona para /onboarding quando autenticado mas onboarding pendente', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: false,
    })

    renderProtectedRoute()
    expect(screen.getByText('Tela de onboarding')).toBeInTheDocument()
  })

  it('renderiza o conteúdo quando autenticado e com onboarding concluído', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })

    renderProtectedRoute()
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
  })
})
