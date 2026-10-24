import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')

const mockedUseAuth = vi.mocked(useAuth)

function renderPublicOnlyRoute(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<p>Formulário de login</p>} />
        </Route>
        <Route path="/dashboard" element={<p>Dashboard</p>} />
        <Route path="/perfil" element={<p>Perfil</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PublicOnlyRoute', () => {
  it('mostra o fallback de carregamento enquanto isInitializing', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: true,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    })

    renderPublicOnlyRoute()
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  it('renderiza o formulário quando não autenticado', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    })

    renderPublicOnlyRoute()
    expect(screen.getByText('Formulário de login')).toBeInTheDocument()
  })

  it('redireciona para o dashboard quando já autenticado e sem ?redirect=', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })

    renderPublicOnlyRoute()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('respeita o ?redirect= validado em vez de ir sempre para o dashboard', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })

    renderPublicOnlyRoute('/login?redirect=%2Fperfil')
    expect(screen.getByText('Perfil')).toBeInTheDocument()
  })

  it('ignora ?redirect= malicioso e cai no fallback do dashboard', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })

    renderPublicOnlyRoute('/login?redirect=https%3A%2F%2Fevil.com')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
