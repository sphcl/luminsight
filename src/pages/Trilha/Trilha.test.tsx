import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Trilha } from './Trilha'
import { useAuth } from '@/hooks/useAuth'
import { getModules } from '@/services/modules.service'
import { getUserProgress } from '@/services/progress.service'
import { TEST_USER, buildTrail } from '@/test/fixtures/modules'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/modules.service', () => ({ getModules: vi.fn() }))
vi.mock('@/services/progress.service', () => ({ getUserProgress: vi.fn() }))

function renderTrilha() {
  return render(
    <MemoryRouter initialEntries={['/trilha']}>
      <Routes>
        <Route path="/trilha" element={<Trilha />} />
        <Route path="/modulos/:moduleId" element={<p>Página do módulo</p>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Trilha', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument: null,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: true,
    })
    vi.mocked(getModules).mockResolvedValue(buildTrail())
    vi.mocked(getUserProgress).mockResolvedValue({})
  })

  it('renderiza os cinco módulos', async () => {
    renderTrilha()

    for (let order = 1; order <= 5; order++) {
      expect(await screen.findByText(`${order}. Módulo ${order}`)).toBeInTheDocument()
    }
    expect(screen.getAllByRole('progressbar')).toHaveLength(5)
  })

  it('não navega ao clicar num módulo bloqueado', async () => {
    const user = userEvent.setup()
    renderTrilha()

    const lockedCard = await screen.findByTestId('module-card-modulo-02')
    expect(lockedCard).toHaveAttribute('aria-disabled', 'true')
    expect(lockedCard.closest('a')).toBeNull()

    await user.click(lockedCard)
    expect(screen.queryByText('Página do módulo')).not.toBeInTheDocument()
  })

  it('navega ao clicar num módulo disponível', async () => {
    const user = userEvent.setup()
    renderTrilha()

    await user.click(await screen.findByTestId('module-card-modulo-01'))
    expect(screen.getByText('Página do módulo')).toBeInTheDocument()
  })

  it('mostra o aviso de conteúdo em construção quando há [PENDENTE]', async () => {
    vi.mocked(getModules).mockResolvedValue(
      buildTrail().map((module, index) =>
        index === 0 ? { ...module, description: '[PENDENTE] descrição' } : module
      )
    )
    renderTrilha()

    expect(
      await screen.findByText(/conteúdo da trilha ainda está em construção/)
    ).toBeInTheDocument()
  })

  it('não mostra o aviso quando não há [PENDENTE]', async () => {
    renderTrilha()

    await screen.findByText('1. Módulo 1')
    expect(screen.queryByText(/em construção/)).not.toBeInTheDocument()
  })
})
