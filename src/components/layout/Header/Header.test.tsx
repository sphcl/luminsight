import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Header } from './Header'
import { useAuth } from '@/hooks/useAuth'
import { TEST_USER } from '@/test/fixtures/modules'
import type { UserDocument } from '@/types/user.types'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/auth.service', () => ({ logout: vi.fn() }))

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={['/trilha']}>
      <Header onToggleSidebar={vi.fn()} />
      <Routes>
        <Route path="/" element={<p>tela:home</p>} />
        <Route path="/trilha" element={<p>tela:trilha</p>} />
        <Route path="/perfil" element={<p>tela:perfil</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Header', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument: { displayName: 'Ana Souza' } as UserDocument,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })
  })

  it('o logo volta para a página inicial', async () => {
    const user = userEvent.setup()
    renderHeader()

    const home = screen.getByRole('link', { name: 'LumInsight, página inicial' })
    expect(home).toHaveAttribute('href', '/')

    await user.click(home)
    expect(screen.getByText('tela:home')).toBeInTheDocument()
  })

  it('o link Home, ao lado dos controles, também volta para a página inicial', async () => {
    const user = userEvent.setup()
    renderHeader()

    const home = screen.getByRole('link', { name: 'Home' })
    expect(home).toHaveAttribute('href', '/')

    await user.click(home)
    expect(screen.getByText('tela:home')).toBeInTheDocument()
  })

  it('o logo é só o nome, sem ícone ao lado', () => {
    renderHeader()

    const logo = screen.getByRole('link', { name: 'LumInsight, página inicial' })
    expect(logo).toHaveTextContent(/^LumInsight$/)
    expect(logo.querySelector('svg')).toBeNull()
  })

  it('avatar e nome levam para o perfil', async () => {
    const user = userEvent.setup()
    renderHeader()

    const profile = screen.getByRole('link', { name: 'Perfil de Ana Souza' })
    expect(profile).toHaveAttribute('href', '/perfil')
    expect(profile).toHaveTextContent('Ana Souza')

    await user.click(profile)
    expect(screen.getByText('tela:perfil')).toBeInTheDocument()
  })

  it('mantém os controles de tema e de tamanho do texto', () => {
    renderHeader()

    expect(screen.getByRole('group', { name: 'Tamanho do texto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ativar tema/ })).toBeInTheDocument()
  })

  it('logado mostra Home e Painel antes dos controles, e perfil e Sair depois', () => {
    renderHeader()

    const order = screen
      .getAllByRole('link')
      .concat(screen.getAllByRole('button'))
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
      .map((element) => element.getAttribute('aria-label') ?? element.textContent?.trim())

    expect(order).toEqual([
      'Abrir menu de navegação',
      'LumInsight, página inicial',
      'Home',
      'Painel',
      'Texto normal',
      'Texto grande',
      'Texto muito grande',
      'Ativar tema escuro',
      'Perfil de Ana Souza',
      'Sair',
    ])
  })

  it('visitante vê Entrar no lugar do perfil, e não vê Painel', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    })
    renderHeader()

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('link', { name: 'Painel' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
  })

  it('sem sidebar o tamanho do texto vira um botão Aa com rótulo, que abre os três tamanhos', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    const button = screen.getByRole('button', { name: 'Tamanho do texto' })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '')
    expect(within(panel as HTMLElement).getAllByRole('button')).toHaveLength(3)

    await user.keyboard('{Escape}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('com sidebar não tem Aa, porque o tamanho do texto fica no menu lateral', () => {
    renderHeader()

    expect(screen.queryByRole('button', { name: 'Tamanho do texto' })).not.toBeInTheDocument()
  })

  it('o botão de menu só aparece onde existe sidebar', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    )

    expect(
      screen.queryByRole('button', { name: 'Abrir menu de navegação' })
    ).not.toBeInTheDocument()
  })
})
