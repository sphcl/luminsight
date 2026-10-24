import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

vi.mock('@/services/auth.service', () => ({ logout: vi.fn() }))
import { logout } from '@/services/auth.service'

function renderSidebar(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar isOpen onNavigate={vi.fn()} />
    </MemoryRouter>
  )
}

describe('Sidebar', () => {
  it('marca a rota ativa com aria-current="page"', () => {
    renderSidebar('/trilha')

    expect(screen.getByRole('link', { name: 'Trilha' })).toHaveAttribute('aria-current', 'page')
  })

  it('não marca as demais rotas como ativas', () => {
    renderSidebar('/trilha')

    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Simulações' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Perfil' })).not.toHaveAttribute('aria-current')
  })

  it('renderiza os quatro links de navegação e o Início que saiu do header no celular', () => {
    renderSidebar('/dashboard')

    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Dashboard',
      'Trilha',
      'Simulações',
      'Perfil',
      'Início',
    ])
  })

  it('traz tamanho do texto, tema e Sair, que no celular não cabem no header', async () => {
    const user = userEvent.setup()
    renderSidebar('/dashboard')

    expect(screen.getByRole('group', { name: 'Tamanho do texto' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ativar tema/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sair' }))
    expect(logout).toHaveBeenCalledOnce()
  })
})
