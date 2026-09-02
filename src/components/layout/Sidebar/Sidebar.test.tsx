import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

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

  it('renderiza os quatro links de navegação', () => {
    renderSidebar('/dashboard')

    expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })
})
