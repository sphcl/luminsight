import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import { Encerramento } from './Encerramento'
import { useAuth } from '@/hooks/useAuth'
import { getUserProgress } from '@/services/progress.service'
import { hasTrailFeedback } from '@/services/research.service'
import { TEST_USER, buildProgress } from '@/test/fixtures/modules'
import type { UserDocument } from '@/types/user.types'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/progress.service', () => ({ getUserProgress: vi.fn() }))
vi.mock('@/services/research.service', () => ({
  hasTrailFeedback: vi.fn(),
  saveTrailFeedback: vi.fn(),
}))

function signIn(accepted: boolean) {
  vi.mocked(useAuth).mockReturnValue({
    user: TEST_USER,
    userDocument: { researchConsent: { accepted } } as UserDocument,
    isInitializing: false,
    isAuthenticated: true,
    hasCompletedOnboarding: true,
  })
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/encerramento']}>
      <Routes>
        <Route path="/encerramento" element={<Encerramento />} />
        <Route path="/dashboard" element={<p>painel</p>} />
      </Routes>
    </MemoryRouter>
  )
}

const finished = { 'modulo-05': buildProgress({ completedAt: Timestamp.now() }) }

describe('Encerramento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    signIn(true)
    vi.mocked(hasTrailFeedback).mockResolvedValue(false)
    vi.mocked(getUserProgress).mockResolvedValue(finished)
  })

  it('mostra as perguntas para quem concluiu e ainda não respondeu', async () => {
    renderPage()

    expect(await screen.findByText('Antes de ir, quatro perguntas')).toBeInTheDocument()
  })

  it('não deixa responder duas vezes', async () => {
    vi.mocked(hasTrailFeedback).mockResolvedValue(true)
    renderPage()

    expect(await screen.findByText(/já respondeu a pesquisa final/)).toBeInTheDocument()
  })

  it('só abre depois de concluir a trilha', async () => {
    vi.mocked(getUserProgress).mockResolvedValue({})
    renderPage()

    expect(await screen.findByText(/abre quando você concluir a trilha/)).toBeInTheDocument()
  })

  it('quem não participa volta pro painel sem nenhuma leitura', async () => {
    signIn(false)
    renderPage()

    expect(await screen.findByText('painel')).toBeInTheDocument()
    expect(hasTrailFeedback).not.toHaveBeenCalled()
  })
})
