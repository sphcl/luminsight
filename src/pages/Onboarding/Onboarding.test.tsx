import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Onboarding } from './Onboarding'
import { useAuth } from '@/hooks/useAuth'
import { completeOnboarding } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { TEST_USER } from '@/test/fixtures/modules'
import type { OnboardingProfile, UserDocument } from '@/types/user.types'

vi.mock('@/hooks/useAuth')
vi.mock('@/services/user.service', () => ({ completeOnboarding: vi.fn() }))

const userDocument = { onboardingCompleted: false } as UserDocument

function renderOnboarding() {
  return render(
    <MemoryRouter initialEntries={['/onboarding']}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<p>Página do dashboard</p>} />
      </Routes>
    </MemoryRouter>
  )
}

async function answerAll(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: 'Intermediário' }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.click(screen.getByRole('radio', { name: 'Prefiro não responder' }))
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  await user.click(screen.getByRole('radio', { name: 'Proteger a família' }))
}

describe('Onboarding', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: TEST_USER,
      userDocument,
      isInitializing: false,
      isAuthenticated: true,
      hasCompletedOnboarding: false,
    })
    vi.mocked(completeOnboarding).mockReset()
    useAuthStore.setState({ userDocument })
  })

  it('mostra uma pergunta por vez com o indicador de progresso', () => {
    renderOnboarding()

    expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument()
    expect(screen.getAllByRole('group')).toHaveLength(1)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('só deixa continuar depois de responder o passo atual', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    const continueButton = screen.getByRole('button', { name: 'Continuar' })
    expect(continueButton).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'Iniciante' }))
    expect(continueButton).toBeEnabled()
  })

  it('só conclui com todas as perguntas respondidas', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByRole('radio', { name: 'Iniciante' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('radio', { name: 'Não' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))

    const finishButton = screen.getByRole('button', { name: 'Concluir' })
    expect(finishButton).toBeDisabled()
    await user.click(finishButton)
    expect(completeOnboarding).not.toHaveBeenCalled()

    await user.click(screen.getByRole('radio', { name: 'Curiosidade' }))
    expect(finishButton).toBeEnabled()
  })

  it('chama completeOnboarding com as respostas e vai pro dashboard', async () => {
    const profile: OnboardingProfile = {
      securityKnowledge: 'intermediario',
      scamExperience: 'prefiro_nao_responder',
      motivation: 'proteger_familia',
    }
    vi.mocked(completeOnboarding).mockResolvedValue(profile)
    const user = userEvent.setup()
    renderOnboarding()

    await answerAll(user)
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(completeOnboarding).toHaveBeenCalledTimes(1)
    expect(completeOnboarding).toHaveBeenCalledWith(TEST_USER.uid, profile)
    expect(useAuthStore.getState().userDocument).toMatchObject({
      onboardingCompleted: true,
      onboardingProfile: profile,
    })
    expect(await screen.findByText('Página do dashboard')).toBeInTheDocument()
  })

  it('mantém as respostas ao voltar um passo', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByRole('radio', { name: 'Avançado' }))
    await user.click(screen.getByRole('button', { name: 'Continuar' }))
    await user.click(screen.getByRole('button', { name: 'Voltar' }))

    expect(screen.getByRole('radio', { name: 'Avançado' })).toBeChecked()
  })

  it('mostra mensagem genérica quando a gravação falha', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(completeOnboarding).mockRejectedValue(new Error('permission-denied'))
    const user = userEvent.setup()
    renderOnboarding()

    await answerAll(user)
    await user.click(screen.getByRole('button', { name: 'Concluir' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível salvar suas respostas'
    )
    expect(screen.queryByText(/permission-denied/)).not.toBeInTheDocument()
    expect(screen.queryByText('Página do dashboard')).not.toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
