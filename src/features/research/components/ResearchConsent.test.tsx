import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { serverTimestamp, Timestamp } from 'firebase/firestore'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/hooks/useAuth'
import { changeResearchConsent, recordLateConsent } from '@/services/user.service'
import { dismissTrailFeedback, hasTrailFeedback } from '@/services/research.service'
import { useAuthStore } from '@/store/auth.store'
import { TEST_USER } from '@/test/fixtures/modules'
import type { ResearchConsent, UserDocument } from '@/types/user.types'
import { ResearchConsentSettings } from './ResearchConsentSettings'
import { TrailFeedbackCard } from './TrailFeedbackCard'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/auth.service', () => ({ logout: vi.fn() }))
vi.mock('@/services/user.service', () => ({
  recordLateConsent: vi.fn(),
  changeResearchConsent: vi.fn(),
}))
vi.mock('@/services/research.service', () => ({
  hasTrailFeedback: vi.fn(),
  dismissTrailFeedback: vi.fn(),
}))

const consent = (accepted: boolean): ResearchConsent => ({
  accepted,
  isAdult: accepted,
  decidedAt: Timestamp.fromDate(new Date('2026-10-01')),
  version: 'onboarding-v1',
})

function signIn(document: Partial<UserDocument>) {
  const userDocument = {
    onboardingCompleted: true,
    displayName: 'Ana',
    ...document,
  } as UserDocument
  vi.mocked(useAuth).mockReturnValue({
    user: TEST_USER,
    userDocument,
    isInitializing: false,
    isAuthenticated: true,
    hasCompletedOnboarding: true,
  })
  useAuthStore.setState({ userDocument })
}

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<p>conteúdo do painel</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('aviso único para quem já tinha conta', () => {
  it('aparece no lugar da página para quem ainda não decidiu', () => {
    signIn({})
    renderLayout()

    expect(screen.getByText(/inclusive o que você já fez aqui/)).toBeInTheDocument()
    expect(screen.queryByText('conteúdo do painel')).not.toBeInTheDocument()
  })

  it('não aparece para quem já decidiu, aceitando ou não', () => {
    signIn({ researchConsent: consent(false) })
    renderLayout()

    expect(screen.getByText('conteúdo do painel')).toBeInTheDocument()
  })

  it('recusar libera o site sem perguntar percepção de risco', async () => {
    signIn({})
    vi.mocked(recordLateConsent).mockResolvedValue({
      researchConsent: {
        ...consent(false),
        decidedAt: serverTimestamp(),
        version: 'retroativo-v1',
      },
    })
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Continuar sem participar' }))

    expect(recordLateConsent).toHaveBeenCalledWith(TEST_USER.uid, {
      isAdult: false,
      accepted: false,
    })
    expect(useAuthStore.getState().userDocument?.researchConsent?.accepted).toBe(false)
  })

  it('aceitar exige a percepção de risco antes de confirmar', async () => {
    signIn({})
    vi.mocked(recordLateConsent).mockResolvedValue({
      researchConsent: { ...consent(true), decidedAt: serverTimestamp(), version: 'retroativo-v1' },
      riskBaseline: { riskPerception: 'muito_alta', collectedAfterUse: true },
    })
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('checkbox', { name: 'Tenho 18 anos ou mais' }))
    await user.click(screen.getByRole('checkbox', { name: 'Aceito participar da pesquisa' }))
    const confirm = screen.getByRole('button', { name: 'Confirmar e continuar' })
    expect(confirm).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'Muito alta' }))
    await user.click(confirm)

    expect(recordLateConsent).toHaveBeenCalledWith(TEST_USER.uid, {
      isAdult: true,
      accepted: true,
      riskPerception: 'muito_alta',
    })
  })
})

describe('pesquisa no Perfil', () => {
  it('sair da pesquisa explica antes que nada do que já foi gravado entra no trabalho', async () => {
    signIn({ researchConsent: consent(true) })
    vi.mocked(changeResearchConsent).mockResolvedValue({
      ...consent(false),
      version: 'retroativo-v1',
    })
    const user = userEvent.setup()
    render(<ResearchConsentSettings />)

    await user.click(screen.getByRole('button', { name: 'Sair da pesquisa' }))
    expect(screen.getByText(/nem o que já foi gravado até agora/)).toBeInTheDocument()
    expect(changeResearchConsent).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Confirmar saída' }))
    expect(changeResearchConsent).toHaveBeenCalledWith(TEST_USER.uid, {
      accepted: false,
      isAdult: true,
    })
  })

  it('entrar mostra o texto completo e as duas caixas antes de confirmar', async () => {
    signIn({ researchConsent: consent(false) })
    vi.mocked(changeResearchConsent).mockResolvedValue({
      ...consent(true),
      version: 'retroativo-v1',
    })
    const user = userEvent.setup()
    render(<ResearchConsentSettings />)

    await user.click(screen.getByRole('button', { name: 'Participar da pesquisa' }))
    const confirm = screen.getByRole('button', { name: 'Confirmar participação' })
    expect(confirm).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: 'Tenho 18 anos ou mais' }))
    await user.click(screen.getByRole('checkbox', { name: 'Aceito participar da pesquisa' }))
    await user.click(confirm)

    expect(changeResearchConsent).toHaveBeenCalledWith(TEST_USER.uid, {
      isAdult: true,
      accepted: true,
    })
  })
})

describe('card da pesquisa final no painel', () => {
  function renderCard(trailCompleted = true) {
    return render(
      <MemoryRouter>
        <TrailFeedbackCard trailCompleted={trailCompleted} />
      </MemoryRouter>
    )
  }

  it('aparece para quem participa, concluiu e ainda não respondeu', async () => {
    signIn({ researchConsent: consent(true) })
    vi.mocked(hasTrailFeedback).mockResolvedValue(false)
    renderCard()

    expect(await screen.findByTestId('trail-feedback-card')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Responder' })).toHaveAttribute('href', '/encerramento')
  })

  it('some depois de responder', async () => {
    signIn({ researchConsent: consent(true) })
    vi.mocked(hasTrailFeedback).mockResolvedValue(true)
    renderCard()

    await vi.waitFor(() => expect(hasTrailFeedback).toHaveBeenCalled())
    expect(screen.queryByTestId('trail-feedback-card')).not.toBeInTheDocument()
  })

  it('nem consulta o banco para quem não participa, não concluiu ou já dispensou', () => {
    signIn({ researchConsent: consent(false) })
    renderCard()
    signIn({ researchConsent: consent(true) })
    renderCard(false)
    signIn({ researchConsent: consent(true), trailFeedbackDismissedAt: serverTimestamp() })
    renderCard()

    expect(hasTrailFeedback).not.toHaveBeenCalled()
  })

  it('dispensar grava e o card não volta', async () => {
    signIn({ researchConsent: consent(true) })
    vi.mocked(hasTrailFeedback).mockResolvedValue(false)
    vi.mocked(dismissTrailFeedback).mockResolvedValue(serverTimestamp())
    const user = userEvent.setup()
    renderCard()

    await user.click(await screen.findByRole('button', { name: 'Dispensar' }))

    expect(dismissTrailFeedback).toHaveBeenCalledWith(TEST_USER.uid)
    expect(useAuthStore.getState().userDocument?.trailFeedbackDismissedAt).toBeDefined()
  })
})
