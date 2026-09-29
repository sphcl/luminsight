import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Modulo } from './Modulo'
import { useAuth } from '@/hooks/useAuth'
import { getLessons, getModules } from '@/services/modules.service'
import { getUserProgress } from '@/services/progress.service'
import { TEST_USER, buildLesson, buildProgress, buildTrail } from '@/test/fixtures/modules'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/modules.service', () => ({ getModules: vi.fn(), getLessons: vi.fn() }))
vi.mock('@/services/progress.service', () => ({ getUserProgress: vi.fn() }))

function renderModulo(moduleId: string) {
  return render(
    <MemoryRouter initialEntries={[`/modulos/${moduleId}`]}>
      <Routes>
        <Route path="/trilha" element={<p>Tela da trilha</p>} />
        <Route path="/modulos/:moduleId" element={<Modulo />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Modulo', () => {
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
    vi.mocked(getLessons).mockResolvedValue([
      buildLesson({ id: 'licao-01', title: 'Primeira lição', order: 1 }),
      buildLesson({ id: 'licao-02', title: 'Segunda lição', order: 2 }),
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redireciona para a trilha no acesso direto por URL a módulo bloqueado', async () => {
    renderModulo('modulo-03')

    expect(await screen.findByText('Tela da trilha')).toBeInTheDocument()
    expect(screen.queryByText('Módulo 3')).not.toBeInTheDocument()
  })

  it('mostra mensagem com link de volta para módulo inexistente', async () => {
    renderModulo('modulo-99')

    expect(await screen.findByText('Módulo não encontrado')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para a trilha' })).toHaveAttribute(
      'href',
      '/trilha'
    )
  })

  it('mostra mensagem genérica em erro do Firestore', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(getModules).mockRejectedValue(
      Object.assign(new Error('x'), { code: 'permission-denied' })
    )
    renderModulo('modulo-01')

    expect(await screen.findByText('Não foi possível carregar o módulo')).toBeInTheDocument()
    expect(screen.queryByText(/permission-denied/)).not.toBeInTheDocument()
  })

  it('aponta o botão principal para a próxima lição não concluída', async () => {
    vi.mocked(getUserProgress).mockResolvedValue({
      'modulo-01': buildProgress({ lessonsCompleted: ['licao-01'] }),
    })
    renderModulo('modulo-01')

    const continueLink = await screen.findByRole('link', { name: 'Continuar de onde parei' })
    expect(continueLink).toHaveAttribute('href', '/modulos/modulo-01/licoes/licao-02')
    expect(screen.getByText('Concluída')).toBeInTheDocument()
  })

  it('aponta o botão principal para a primeira lição quando nada foi feito', async () => {
    renderModulo('modulo-01')

    const startLink = await screen.findByRole('link', { name: 'Começar módulo' })
    expect(startLink).toHaveAttribute('href', '/modulos/modulo-01/licoes/licao-01')
  })
})
