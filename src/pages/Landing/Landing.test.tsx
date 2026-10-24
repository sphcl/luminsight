import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Landing } from './Landing'
import { useAuth } from '@/hooks/useAuth'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/auth.service', () => ({ logout: vi.fn() }))

function renderLanding(isAuthenticated: boolean) {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    userDocument: null,
    isInitializing: false,
    isAuthenticated,
    hasCompletedOnboarding: isAuthenticated,
  })
  return render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  )
}

describe('Landing', () => {
  it('não mostra número de pessoas nem nenhum [PENDENTE]', async () => {
    renderLanding(false)

    await screen.findByRole('heading', { name: /módulos, do conceito ao caso real/ })
    expect(document.body).not.toHaveTextContent('[PENDENTE]')
    expect(document.body).not.toHaveTextContent(/concluíram a trilha/)
  })

  it('tem uma única ação primária, repetida, para começar a trilha', () => {
    renderLanding(false)

    const starts = screen.getAllByRole('link', { name: 'Começar a trilha' })
    expect(starts).toHaveLength(2)
    starts.forEach((link) => expect(link).toHaveAttribute('href', '/register'))
  })

  it('usa o mesmo header do resto do site', () => {
    renderLanding(false)

    const header = screen.getByRole('banner')
    expect(header).toContainElement(
      screen.getByRole('link', { name: 'LumInsight, página inicial' })
    )
    expect(header).toContainElement(screen.getByRole('link', { name: 'Home' }))
    expect(header).toContainElement(screen.getByRole('link', { name: 'Entrar' }))
  })

  it('pra quem já está logado o botão principal vira Continuar a trilha e vai pro painel', () => {
    renderLanding(true)

    const starts = screen.getAllByRole('link', { name: 'Continuar a trilha' })
    expect(starts).toHaveLength(2)
    starts.forEach((link) => expect(link).toHaveAttribute('href', '/dashboard'))
    expect(screen.getByRole('link', { name: 'Painel' })).toHaveAttribute('href', '/dashboard')
  })
})
